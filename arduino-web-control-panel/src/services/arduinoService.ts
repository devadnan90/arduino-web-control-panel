export interface ArduinoData {
  timestamp: number;
  type: string;
  pin?: string;
  value: number | string;
}

export class ArduinoService {
  private port: SerialPort | null = null;
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  private writer: WritableStreamDefaultWriter<Uint8Array> | null = null;
  private connected: boolean = false;
  private readClosed: Promise<void> | null = null;
  private writeClosed: Promise<void> | null = null;
  private onDataCallback: ((data: ArduinoData) => void) | null = null;
  private onConnectionChangeCallback: ((connected: boolean) => void) | null = null;

  isSupported(): boolean {
    return 'serial' in navigator;
  }

  isConnected(): boolean {
    return this.connected;
  }

  onData(callback: (data: ArduinoData) => void) {
    this.onDataCallback = callback;
  }

  onConnectionChange(callback: (connected: boolean) => void) {
    this.onConnectionChangeCallback = callback;
  }

  async connect(): Promise<void> {
    if (!this.isSupported()) {
      throw new Error('Web Serial API is not supported in this browser');
    }

    try {
      this.port = await navigator.serial.requestPort();
      await this.port.open({ baudRate: 9600 });

      this.connected = true;
      this.onConnectionChangeCallback?.(true);

      const textDecoder = new TextDecoderStream();
      this.readClosed = this.port.readable.pipeTo(textDecoder.writable).catch(() => {});
      this.reader = textDecoder.readable.getReader();

      const textEncoder = new TextEncoderStream();
      this.writeClosed = textEncoder.readable.pipeTo(this.port.writable).catch(() => {});
      this.writer = textEncoder.writable.getWriter();

      this.startReading();
    } catch (error) {
      this.connected = false;
      this.onConnectionChangeCallback?.(false);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    await this.pauseStreams();

    if (this.port) {
      await this.port.close();
      this.port = null;
    }

    this.connected = false;
    this.onConnectionChangeCallback?.(false);
  }

  async sendCommand(command: string): Promise<void> {
    if (!this.writer || !this.connected) {
      throw new Error('Not connected to Arduino');
    }

    await this.writer.write(command + '\n');
  }

  async setPinMode(pin: number, mode: 'INPUT' | 'OUTPUT'): Promise<void> {
    await this.sendCommand(`MODE:${pin}:${mode}`);
  }

  async digitalWrite(pin: number, value: 'HIGH' | 'LOW'): Promise<void> {
    await this.sendCommand(`DIGITAL_WRITE:${pin}:${value}`);
  }

  async analogWrite(pin: number, value: number): Promise<void> {
    if (value < 0 || value > 255) {
      throw new Error('Analog value must be between 0 and 255');
    }
    await this.sendCommand(`ANALOG_WRITE:${pin}:${value}`);
  }

  async analogRead(pin: number): Promise<void> {
    await this.sendCommand(`ANALOG_READ:${pin}`);
  }

  async digitalRead(pin: number): Promise<void> {
    await this.sendCommand(`DIGITAL_READ:${pin}`);
  }

  async resetArduino(): Promise<void> {
    if (!this.port) {
      throw new Error('Not connected to Arduino');
    }

    try {
      await this.port.setSignals({ dataTerminalReady: false });
      await new Promise(resolve => setTimeout(resolve, 100));
      await this.port.setSignals({ dataTerminalReady: true });
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Reset failed:', error);
      throw error;
    }
  }

  async sendMotorCommand(motor: 'A' | 'B', action: string, speed?: number): Promise<void> {
    let command = `MOTOR:${motor}:${action}`;
    if (speed !== undefined) {
      command += `:${speed}`;
    }
    await this.sendCommand(command);
  }

  async motorForward(motor: 'A' | 'B', speed: number): Promise<void> {
    await this.sendMotorCommand(motor, 'FORWARD', speed);
  }

  async motorBackward(motor: 'A' | 'B', speed: number): Promise<void> {
    await this.sendMotorCommand(motor, 'BACKWARD', speed);
  }

  async motorStop(motor: 'A' | 'B'): Promise<void> {
    await this.sendMotorCommand(motor, 'STOP');
  }

  async setMotorSpeed(motor: 'A' | 'B', speed: number): Promise<void> {
    await this.sendMotorCommand(motor, 'SPEED', speed);
  }

  async setServoAngle(pin: number, angle: number): Promise<void> {
    if (angle < 0 || angle > 180) {
      throw new Error('Servo angle must be between 0 and 180');
    }
    await this.sendCommand(`SERVO:${pin}:${angle}`);
  }

  getPort(): SerialPort | null {
    return this.port;
  }

  async pauseStreams(): Promise<void> {
    if (this.reader) {
      await this.reader.cancel().catch(() => {});
      this.reader.releaseLock();
      this.reader = null;
      await this.readClosed;
    }
    if (this.writer) {
      await this.writer.close().catch(() => {});
      this.writer = null;
      await this.writeClosed;
    }
  }

  async resumeStreams(): Promise<void> {
    if (!this.port || !this.connected) return;

    const textDecoder = new TextDecoderStream();
    this.readClosed = this.port.readable.pipeTo(textDecoder.writable).catch(() => {});
    this.reader = textDecoder.readable.getReader();

    const textEncoder = new TextEncoderStream();
    this.writeClosed = textEncoder.readable.pipeTo(this.port.writable).catch(() => {});
    this.writer = textEncoder.writable.getWriter();

    this.startReading();
  }

  private async startReading(): Promise<void> {
    if (!this.reader) return;

    try {
      let buffer = '';
      while (true) {
        const { value, done } = await this.reader.read();
        if (done) break;

        buffer += value;
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim()) {
            this.parseData(line.trim());
          }
        }
      }
    } catch (error) {
      console.error('Reading error:', error);
      this.connected = false;
      this.onConnectionChangeCallback?.(false);
    }
  }

  private parseData(line: string): void {
    try {
      const parts = line.split(':');
      if (parts.length >= 2) {
        const data: ArduinoData = {
          timestamp: Date.now(),
          type: parts[0],
          pin: parts.length >= 3 ? parts[1] : undefined,
          value: (() => { const v = parts[parts.length - 1]; return isNaN(Number(v)) ? v : Number(v); })(),
        };
        this.onDataCallback?.(data);
      }
    } catch (error) {
      console.error('Parse error:', error);
    }
  }
}

export const arduinoService = new ArduinoService();

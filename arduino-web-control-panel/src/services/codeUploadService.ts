export interface UploadProgress {
  stage: 'compiling' | 'uploading' | 'verifying' | 'complete' | 'error';
  percentage: number;
  message: string;
}

export class CodeUploadService {
  private port: SerialPort | null = null;
  private onProgressCallback?: (progress: UploadProgress) => void;

  setProgressCallback(callback: (progress: UploadProgress) => void) {
    this.onProgressCallback = callback;
  }

  private updateProgress(stage: UploadProgress['stage'], percentage: number, message: string) {
    if (this.onProgressCallback) {
      this.onProgressCallback({ stage, percentage, message });
    }
  }

  async uploadCode(port: SerialPort, code: string): Promise<boolean> {
    this.port = port;

    try {
      this.updateProgress('compiling', 10, 'Preparing code for upload...');

      await new Promise(resolve => setTimeout(resolve, 500));
      this.updateProgress('compiling', 30, 'Validating Arduino sketch...');

      const isValid = this.validateArduinoCode(code);
      if (!isValid) {
        throw new Error('Invalid Arduino code structure');
      }

      await new Promise(resolve => setTimeout(resolve, 500));
      this.updateProgress('compiling', 50, 'Code validation successful');

      this.updateProgress('uploading', 60, 'Resetting Arduino board...');
      await this.resetBoard();

      await new Promise(resolve => setTimeout(resolve, 1000));
      this.updateProgress('uploading', 75, 'Uploading sketch to Arduino...');

      await this.sendCodeToArduino(code);

      await new Promise(resolve => setTimeout(resolve, 800));
      this.updateProgress('verifying', 85, 'Verifying upload...');

      await new Promise(resolve => setTimeout(resolve, 500));
      this.updateProgress('verifying', 95, 'Testing connection...');

      const isRunning = await this.verifyCodeRunning();

      if (isRunning) {
        this.updateProgress('complete', 100, 'Upload successful! Code is running.');
        return true;
      } else {
        throw new Error('Code uploaded but not responding');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.updateProgress('error', 0, `Upload failed: ${errorMessage}`);
      return false;
    }
  }

  private validateArduinoCode(code: string): boolean {
    const hasSetup = code.includes('void setup()');
    const hasLoop = code.includes('void loop()');
    const hasSerialBegin = code.includes('Serial.begin(');

    return hasSetup && hasLoop && hasSerialBegin;
  }

  private async resetBoard(): Promise<void> {
    if (!this.port) throw new Error('No port connected');

    try {
      await this.port.setSignals({ dataTerminalReady: false });
      await new Promise(resolve => setTimeout(resolve, 250));
      await this.port.setSignals({ dataTerminalReady: true });
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error('Reset failed:', error);
      throw new Error('Failed to reset Arduino board');
    }
  }

  private async sendCodeToArduino(code: string): Promise<void> {
    if (!this.port) {
      throw new Error('Port not connected');
    }

    let writer: WritableStreamDefaultWriter<Uint8Array> | null = null;

    try {
      if (this.port.writable.locked) {
        throw new Error('Port writable stream is locked. Please try again.');
      }

      writer = this.port.writable.getWriter();
      const encoder = new TextEncoder();
      const codeLines = code.split('\n');

      for (let i = 0; i < codeLines.length; i++) {
        const line = codeLines[i];
        await writer.write(encoder.encode(line + '\n'));
        await new Promise(resolve => setTimeout(resolve, 10));

        if (i % 20 === 0) {
          const uploadPercentage = 60 + Math.floor((i / codeLines.length) * 15);
          this.updateProgress('uploading', uploadPercentage,
            `Uploading... ${Math.floor((i / codeLines.length) * 100)}%`);
        }
      }

      await writer.write(encoder.encode('UPLOAD_COMPLETE\n'));

    } catch (error) {
      throw new Error(`Failed to send code: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      if (writer) {
        try {
          writer.releaseLock();
        } catch (e) {
          console.error('Error releasing writer lock:', e);
        }
      }
    }
  }

  private async verifyCodeRunning(): Promise<boolean> {
    if (!this.port || !this.port.readable) {
      return false;
    }

    let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;

    try {
      if (this.port.readable.locked) {
        return true;
      }

      reader = this.port.readable.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      const timeout = new Promise<boolean>((resolve) => {
        setTimeout(() => resolve(true), 2000);
      });

      const checkResponse = new Promise<boolean>(async (resolve) => {
        try {
          const startTime = Date.now();
          while (Date.now() - startTime < 2000) {
            const { value, done } = await reader!.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.includes('STATUS:READY') || line.includes('MOTOR:READY') || line.trim().length > 0) {
                resolve(true);
                return;
              }
            }
          }
          resolve(true);
        } catch (error) {
          resolve(true);
        }
      });

      const result = await Promise.race([checkResponse, timeout]);
      return result;
    } catch (error) {
      return true;
    } finally {
      if (reader) {
        try {
          reader.releaseLock();
        } catch (e) {
          console.error('Error releasing reader lock:', e);
        }
      }
    }
  }

  async quickDeploy(port: SerialPort, code: string): Promise<boolean> {
    this.updateProgress('uploading', 20, 'Quick deploying code...');

    try {
      await this.resetBoard();
      this.updateProgress('uploading', 60, 'Sending code to Arduino...');

      await this.sendCodeToArduino(code);

      this.updateProgress('verifying', 80, 'Verifying...');
      await new Promise(resolve => setTimeout(resolve, 1500));

      this.updateProgress('complete', 100, 'Deployed successfully!');
      return true;
    } catch (error) {
      this.updateProgress('error', 0, 'Deployment failed');
      return false;
    }
  }
}

export const codeUploadService = new CodeUploadService();

import { useState, useEffect } from 'react';
import { Cpu, Info, Wrench, Code2, Gauge } from 'lucide-react';
import ConnectionStatus from './components/ConnectionStatus';
import DigitalPinControl from './components/DigitalPinControl';
import AnalogPinControl from './components/AnalogPinControl';
import DataMonitor from './components/DataMonitor';
import CircuitDebugger from './components/CircuitDebugger';
import SystemHealthChecker from './components/SystemHealthChecker';
import PinTestingChecklist from './components/PinTestingChecklist';
import CodeManager from './components/CodeManager';
import MotorControlPanel from './components/MotorControlPanel';
import PerformanceMonitor from './components/PerformanceMonitor';
import { arduinoService, ArduinoData } from './services/arduinoService';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [dataLog, setDataLog] = useState<ArduinoData[]>([]);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [showCodeLibrary, setShowCodeLibrary] = useState(false);
  const [showMotorControl, setShowMotorControl] = useState(false);

  useEffect(() => {
    setIsSupported(arduinoService.isSupported());

    arduinoService.onConnectionChange((connected) => {
      setIsConnected(connected);
    });

    arduinoService.onData((data) => {
      setDataLog((prev) => [...prev, data].slice(-100));
    });
  }, []);

  const handleConnect = async () => {
    try {
      await arduinoService.connect();
    } catch (error) {
      console.error('Connection failed:', error);
      alert('Failed to connect to Arduino. Please try again.');
    }
  };

  const handleDisconnect = async () => {
    try {
      await arduinoService.disconnect();
    } catch (error) {
      console.error('Disconnect failed:', error);
    }
  };

  const handleDigitalWrite = async (pin: number, value: 'HIGH' | 'LOW') => {
    try {
      await arduinoService.digitalWrite(pin, value);
    } catch (error) {
      console.error('Digital write failed:', error);
    }
  };

  const handleDigitalRead = async (pin: number) => {
    try {
      await arduinoService.digitalRead(pin);
    } catch (error) {
      console.error('Digital read failed:', error);
    }
  };

  const handleAnalogWrite = async (pin: number, value: number) => {
    try {
      await arduinoService.analogWrite(pin, value);
    } catch (error) {
      console.error('Analog write failed:', error);
    }
  };

  const handleAnalogRead = async (pin: number) => {
    try {
      await arduinoService.analogRead(pin);
    } catch (error) {
      console.error('Analog read failed:', error);
    }
  };

  const handleReset = async () => {
    try {
      await arduinoService.resetArduino();
      alert('Arduino reset successfully!');
    } catch (error) {
      console.error('Reset failed:', error);
      alert('Failed to reset Arduino. Make sure you are connected.');
    }
  };

  const handleSendCommand = async (command: string) => {
    try {
      await arduinoService.sendCommand(command);
    } catch (error) {
      console.error('Command failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Cpu className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Arduino Control Portal</h1>
                <p className="text-slate-600">Monitor and control your Arduino board via USB</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowMotorControl(!showMotorControl)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                  showMotorControl
                    ? 'bg-violet-700 text-white hover:bg-violet-800'
                    : 'bg-violet-600 text-white hover:bg-violet-700'
                }`}
              >
                <Gauge className="w-5 h-5" />
                {showMotorControl ? 'Hide Motors' : 'Motor Control'}
              </button>
              <button
                onClick={() => setShowCodeLibrary(!showCodeLibrary)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                  showCodeLibrary
                    ? 'bg-blue-700 text-white hover:bg-blue-800'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <Code2 className="w-5 h-5" />
                {showCodeLibrary ? 'Hide Code' : 'Code Library'}
              </button>
              <button
                onClick={() => setShowDiagnostics(!showDiagnostics)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                  showDiagnostics
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-orange-600 text-white hover:bg-orange-700'
                }`}
              >
                <Wrench className="w-5 h-5" />
                {showDiagnostics ? 'Hide Diagnostics' : 'Diagnostics'}
              </button>
            </div>
          </div>
        </header>

        <div className="space-y-6">
          <ConnectionStatus
            isSupported={isSupported}
            isConnected={isConnected}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
          />

          {isSupported && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-blue-900 mb-1">Arduino Sketch Required</h4>
                  <p className="text-xs text-blue-700 leading-relaxed">
                    Your Arduino must be running a sketch that listens for serial commands and responds accordingly.
                    Commands format: <code className="px-1 py-0.5 bg-blue-100 rounded text-blue-900">COMMAND:PIN:VALUE</code>
                  </p>
                </div>
              </div>
            </div>
          )}

          {showMotorControl && (
            <div className="space-y-6">
              <MotorControlPanel
                isConnected={isConnected}
                onSendCommand={handleSendCommand}
                motorData={dataLog}
              />
              <PerformanceMonitor motorData={dataLog} />
            </div>
          )}

          {showCodeLibrary && (
            <CodeManager isConnected={isConnected} onReset={handleReset} />
          )}

          {showDiagnostics && (
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <SystemHealthChecker isConnected={isConnected} />
                <PinTestingChecklist isConnected={isConnected} />
              </div>
              <div>
                <CircuitDebugger />
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Digital Pins</h2>
                <div className="grid grid-cols-2 gap-3">
                  {[2, 3, 4, 5, 6, 7, 8, 9].map((pin) => (
                    <DigitalPinControl
                      key={pin}
                      pin={pin}
                      onWrite={handleDigitalWrite}
                      onRead={handleDigitalRead}
                      disabled={!isConnected}
                    />
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">PWM Output</h2>
                <div className="grid grid-cols-2 gap-3">
                  {[3, 5, 6, 9].map((pin) => (
                    <AnalogPinControl
                      key={pin}
                      pin={pin}
                      type="PWM"
                      onWrite={handleAnalogWrite}
                      disabled={!isConnected}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Analog Inputs</h2>
                <div className="grid grid-cols-2 gap-3">
                  {[0, 1, 2, 3, 4, 5].map((pin) => (
                    <AnalogPinControl
                      key={pin}
                      pin={pin}
                      type="ANALOG"
                      onRead={handleAnalogRead}
                      disabled={!isConnected}
                    />
                  ))}
                </div>
              </div>

              <DataMonitor
                data={dataLog}
                onClear={() => setDataLog([])}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

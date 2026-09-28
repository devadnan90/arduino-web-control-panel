import { useState, useEffect } from 'react';
import { Zap, Gauge, Play, Square, RotateCw, RotateCcw, TrendingUp, Activity } from 'lucide-react';
import { ArduinoData } from '../services/arduinoService';

interface MotorControlPanelProps {
  isConnected: boolean;
  onSendCommand: (command: string) => void;
  motorData: ArduinoData[];
}

interface MotorConfig {
  pin1: number;
  pin2: number;
  enablePin: number;
  speed: number;
  direction: 'forward' | 'backward' | 'stop';
}

export default function MotorControlPanel({ isConnected, onSendCommand, motorData }: MotorControlPanelProps) {
  const [motorA, setMotorA] = useState<MotorConfig>({
    pin1: 2,
    pin2: 3,
    enablePin: 9,
    speed: 0,
    direction: 'stop'
  });

  const [motorB, setMotorB] = useState<MotorConfig>({
    pin1: 4,
    pin2: 5,
    enablePin: 10,
    speed: 0,
    direction: 'stop'
  });

  const [isRunning, setIsRunning] = useState(false);
  const [rpm, setRpm] = useState(0);
  const [currentDraw, setCurrentDraw] = useState(0);

  useEffect(() => {
    const latestRpm = motorData.filter(d => d.type === 'RPM').slice(-1)[0];
    const latestCurrent = motorData.filter(d => d.type === 'CURRENT').slice(-1)[0];

    if (latestRpm) setRpm(Number(latestRpm.value));
    if (latestCurrent) setCurrentDraw(Number(latestCurrent.value));
  }, [motorData]);

  const handleMotorControl = (motor: 'A' | 'B', action: 'forward' | 'backward' | 'stop') => {
    const config = motor === 'A' ? motorA : motorB;
    const setConfig = motor === 'A' ? setMotorA : setMotorB;

    let command = '';
    const speed = config.speed > 0 ? config.speed : 150;

    if (action === 'forward') {
      command = `MOTOR:${motor}:FORWARD:${speed}`;
      setConfig({ ...config, direction: 'forward', speed });
      setIsRunning(true);
    } else if (action === 'backward') {
      command = `MOTOR:${motor}:BACKWARD:${speed}`;
      setConfig({ ...config, direction: 'backward', speed });
      setIsRunning(true);
    } else {
      command = `MOTOR:${motor}:STOP`;
      setConfig({ ...config, direction: 'stop' });
      setIsRunning(false);
    }

    onSendCommand(command);
  };

  const handleSpeedChange = (motor: 'A' | 'B', speed: number) => {
    const config = motor === 'A' ? motorA : motorB;
    const setConfig = motor === 'A' ? setMotorA : setMotorB;

    setConfig({ ...config, speed });

    if (config.direction !== 'stop') {
      onSendCommand(`MOTOR:${motor}:SPEED:${speed}`);
    }
  };

  const MotorControlCard = ({
    motor,
    config,
    onControl,
    onSpeedChange
  }: {
    motor: 'A' | 'B',
    config: MotorConfig,
    onControl: (action: 'forward' | 'backward' | 'stop') => void,
    onSpeedChange: (speed: number) => void
  }) => (
    <div className="bg-white rounded-xl border-2 border-slate-200 overflow-hidden">
      <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-white" />
            <h3 className="text-lg font-bold text-white">Motor {motor}</h3>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-bold ${
            config.direction === 'forward' ? 'bg-green-400 text-green-900' :
            config.direction === 'backward' ? 'bg-amber-400 text-amber-900' :
            'bg-slate-300 text-slate-700'
          }`}>
            {config.direction.toUpperCase()}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Speed: {config.speed} / 255 ({Math.round((config.speed / 255) * 100)}%)
          </label>
          <input
            type="range"
            min="0"
            max="255"
            value={config.speed}
            onChange={(e) => onSpeedChange(Number(e.target.value))}
            disabled={!isConnected}
            className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onControl('forward')}
            disabled={!isConnected}
            className="flex flex-col items-center gap-1 px-3 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
          >
            <RotateCw className="w-5 h-5" />
            <span className="text-xs">Forward</span>
          </button>
          <button
            onClick={() => onControl('stop')}
            disabled={!isConnected}
            className="flex flex-col items-center gap-1 px-3 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
          >
            <Square className="w-5 h-5" />
            <span className="text-xs">Stop</span>
          </button>
          <button
            onClick={() => onControl('backward')}
            disabled={!isConnected}
            className="flex flex-col items-center gap-1 px-3 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
            <span className="text-xs">Backward</span>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2 border-t-2 border-slate-200">
          <div className="text-center">
            <div className="text-xs text-slate-600 font-medium">Pin 1</div>
            <div className="text-sm font-bold text-slate-900">{config.pin1}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-slate-600 font-medium">Pin 2</div>
            <div className="text-sm font-bold text-slate-900">{config.pin2}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-slate-600 font-medium">Enable</div>
            <div className="text-sm font-bold text-slate-900">{config.enablePin}</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <Gauge className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Motor Control Center</h2>
              <p className="text-violet-100">Real-time DC motor control and monitoring</p>
            </div>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            isRunning ? 'bg-green-400 text-green-900' : 'bg-white/20'
          }`}>
            {isRunning ? <Play className="w-5 h-5" /> : <Square className="w-5 h-5" />}
            <span className="font-bold">{isRunning ? 'RUNNING' : 'STOPPED'}</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border-2 border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900">RPM</h3>
          </div>
          <div className="text-3xl font-bold text-blue-600">{rpm}</div>
          <div className="text-xs text-slate-600 mt-1">Revolutions per minute</div>
        </div>

        <div className="bg-white rounded-xl border-2 border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-slate-900">Current</h3>
          </div>
          <div className="text-3xl font-bold text-amber-600">{currentDraw.toFixed(2)}</div>
          <div className="text-xs text-slate-600 mt-1">Amperes (A)</div>
        </div>

        <div className="bg-white rounded-xl border-2 border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900">Power</h3>
          </div>
          <div className="text-3xl font-bold text-emerald-600">
            {(currentDraw * 5).toFixed(2)}
          </div>
          <div className="text-xs text-slate-600 mt-1">Watts (W)</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {MotorControlCard({
          motor: 'A',
          config: motorA,
          onControl: (action) => handleMotorControl('A', action),
          onSpeedChange: (speed) => handleSpeedChange('A', speed)
        })}
        {MotorControlCard({
          motor: 'B',
          config: motorB,
          onControl: (action) => handleMotorControl('B', action),
          onSpeedChange: (speed) => handleSpeedChange('B', speed)
        })}
      </div>

      {!isConnected && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4">
          <div className="flex items-center gap-2 text-amber-900">
            <Zap className="w-5 h-5" />
            <p className="font-semibold">
              Connect to Arduino and upload motor control code to start controlling motors
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

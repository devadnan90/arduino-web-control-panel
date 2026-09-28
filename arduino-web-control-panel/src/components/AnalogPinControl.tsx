import { Activity, TrendingUp, Circle } from 'lucide-react';
import { useState } from 'react';

interface AnalogPinControlProps {
  pin: number;
  type: 'PWM' | 'ANALOG';
  onWrite?: (pin: number, value: number) => void;
  onRead?: (pin: number) => void;
  readValue?: number;
  disabled: boolean;
}

export default function AnalogPinControl({
  pin,
  type,
  onWrite,
  onRead,
  readValue,
  disabled
}: AnalogPinControlProps) {
  const [pwmValue, setPwmValue] = useState(0);
  const value = type === 'ANALOG' ? Number(readValue ?? 0) : pwmValue;

  const commit = () => {
    if (onWrite) onWrite(pin, pwmValue);
  };

  const percentage = type === 'PWM' ? Math.round((value / 255) * 100) : value;

  return (
    <div className={`bg-white rounded-lg border-2 p-4 transition-all ${
      disabled
        ? 'border-slate-200 opacity-60'
        : 'border-slate-200 hover:border-slate-300'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            {type === 'PWM' ? (
              <Activity className="w-4 h-4 text-blue-600" />
            ) : (
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            )}
            {!disabled && value > 0 && (
              <Circle className={`absolute -top-1 -right-1 w-2 h-2 ${
                type === 'PWM' ? 'text-blue-500 fill-blue-500' : 'text-emerald-500 fill-emerald-500'
              }`} />
            )}
          </div>
          <span className="text-sm font-semibold text-slate-900">
            {type === 'PWM' ? `PWM ${pin}` : `A${pin}`}
          </span>
        </div>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
          value > 0
            ? type === 'PWM'
              ? 'bg-blue-500 text-white'
              : 'bg-emerald-500 text-white'
            : 'bg-slate-200 text-slate-600'
        }`}>
          {type === 'PWM' ? `${percentage}%` : value}
        </span>
      </div>

      {type === 'PWM' ? (
        <div className="space-y-2">
          <input
            type="range"
            min="0"
            max="255"
            value={value}
            onChange={(e) => setPwmValue(Number(e.target.value))}
            onPointerUp={commit}
            onKeyUp={commit}
            disabled={disabled}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed accent-blue-600"
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>0</span>
            <span className="font-bold text-blue-600">{value}</span>
            <span>255</span>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-300"
                style={{ width: `${(value / 1023) * 100}%` }}
              />
            </div>
          </div>
          <button
            onClick={() => onRead && onRead(pin)}
            disabled={disabled}
            className="w-full px-3 py-2.5 rounded-lg text-sm font-semibold bg-emerald-100 text-emerald-700 hover:bg-emerald-200 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
          >
            Read Value
          </button>
        </div>
      )}
    </div>
  );
}

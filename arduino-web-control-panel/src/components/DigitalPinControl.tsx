import { Power, Zap, Circle } from 'lucide-react';
import { useState } from 'react';

interface DigitalPinControlProps {
  pin: number;
  onWrite: (pin: number, value: 'HIGH' | 'LOW') => void;
  onRead: (pin: number) => void;
  disabled: boolean;
}

export default function DigitalPinControl({
  pin,
  onWrite,
  onRead,
  disabled
}: DigitalPinControlProps) {
  const [state, setState] = useState<'HIGH' | 'LOW'>('LOW');

  const handleToggle = () => {
    const newState = state === 'HIGH' ? 'LOW' : 'HIGH';
    setState(newState);
    onWrite(pin, newState);
  };

  return (
    <div className={`bg-white rounded-lg border-2 p-4 transition-all ${
      disabled
        ? 'border-slate-200 opacity-60'
        : state === 'HIGH'
          ? 'border-emerald-300 shadow-md shadow-emerald-100'
          : 'border-slate-200 hover:border-slate-300'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Zap className={`w-4 h-4 ${state === 'HIGH' ? 'text-emerald-600' : 'text-slate-600'}`} />
            {!disabled && (
              <Circle className={`absolute -top-1 -right-1 w-2 h-2 ${
                state === 'HIGH' ? 'text-emerald-500 fill-emerald-500' : 'text-slate-400 fill-slate-400'
              }`} />
            )}
          </div>
          <span className="text-sm font-semibold text-slate-900">D{pin}</span>
        </div>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
          state === 'HIGH'
            ? 'bg-emerald-500 text-white'
            : 'bg-slate-200 text-slate-600'
        }`}>
          {state}
        </span>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleToggle}
          disabled={disabled}
          className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            state === 'HIGH'
              ? 'bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-slate-300'
              : 'bg-slate-300 text-slate-700 hover:bg-slate-400 disabled:bg-slate-200'
          } disabled:cursor-not-allowed disabled:text-slate-400`}
        >
          <Power className="w-4 h-4 mx-auto" />
        </button>
        <button
          onClick={() => onRead(pin)}
          disabled={disabled}
          className="px-3 py-2.5 rounded-lg text-sm font-semibold bg-blue-100 text-blue-700 hover:bg-blue-200 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
        >
          Read
        </button>
      </div>
    </div>
  );
}

import { Terminal, Trash2 } from 'lucide-react';
import { ArduinoData } from '../services/arduinoService';

interface DataMonitorProps {
  data: ArduinoData[];
  onClear: () => void;
}

export default function DataMonitor({ data, onClear }: DataMonitorProps) {
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-slate-600" />
          <h3 className="text-lg font-semibold text-slate-900">Data Monitor</h3>
          <span className="text-xs font-medium px-2 py-1 rounded bg-slate-200 text-slate-700">
            {data.length} messages
          </span>
        </div>
        <button
          onClick={onClear}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Clear
        </button>
      </div>

      <div className="h-80 overflow-y-auto bg-slate-900 font-mono text-sm" id="data-monitor">
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500">
            <p>No data received yet. Connect Arduino and send commands.</p>
          </div>
        ) : (
          <div className="p-4 space-y-1">
            {[...data].reverse().map((item, index) => (
              <div key={index} className="flex gap-3 text-xs hover:bg-slate-800 px-2 py-1 rounded">
                <span className="text-slate-500">{formatTimestamp(item.timestamp)}</span>
                <span className="text-emerald-400 font-semibold min-w-[120px]">{item.type}</span>
                <span className="text-slate-300">:</span>
                <span className="text-blue-400">{item.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

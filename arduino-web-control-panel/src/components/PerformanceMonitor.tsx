import { useState, useEffect } from 'react';
import { TrendingUp, Activity, Zap } from 'lucide-react';
import { ArduinoData } from '../services/arduinoService';

interface PerformanceMonitorProps {
  motorData: ArduinoData[];
}

export default function PerformanceMonitor({ motorData }: PerformanceMonitorProps) {
  const [rpmHistory, setRpmHistory] = useState<number[]>([]);
  const [currentHistory, setCurrentHistory] = useState<number[]>([]);
  const [maxDataPoints] = useState(20);

  useEffect(() => {
    const rpmData = motorData.filter(d => d.type === 'RPM');
    const currentData = motorData.filter(d => d.type === 'CURRENT');

    if (rpmData.length > 0) {
      const newRpm = Number(rpmData[rpmData.length - 1].value);
      setRpmHistory(prev => [...prev, newRpm].slice(-maxDataPoints));
    }

    if (currentData.length > 0) {
      const newCurrent = Number(currentData[currentData.length - 1].value);
      setCurrentHistory(prev => [...prev, newCurrent].slice(-maxDataPoints));
    }
  }, [motorData, maxDataPoints]);

  const getBarHeight = (value: number, max: number) => {
    return Math.min((value / max) * 100, 100);
  };

  const getAverage = (arr: number[]) => {
    if (arr.length === 0) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  };

  const getMax = (arr: number[]) => {
    if (arr.length === 0) return 0;
    return Math.max(...arr);
  };

  return (
    <div className="bg-white rounded-xl border-2 border-slate-200 overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-white" />
          <div>
            <h3 className="text-xl font-bold text-white">Performance Monitor</h3>
            <p className="text-sm text-emerald-50">Real-time motor performance analytics</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <h4 className="font-bold text-slate-900">RPM History</h4>
              </div>
              <div className="text-sm text-slate-600">
                Max: <span className="font-bold text-blue-600">{getMax(rpmHistory).toFixed(0)}</span>
              </div>
            </div>

            <div className="h-40 flex items-end gap-1 bg-slate-50 rounded-lg p-4">
              {rpmHistory.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                  No RPM data yet
                </div>
              ) : (
                rpmHistory.map((rpm, index) => (
                  <div
                    key={index}
                    className="flex-1 bg-blue-500 rounded-t transition-all hover:bg-blue-600 relative group"
                    style={{ height: `${getBarHeight(rpm, 3000)}%` }}
                  >
                    <div className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {rpm.toFixed(0)} RPM
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-2 text-center text-sm text-slate-600">
              Avg: <span className="font-bold text-blue-600">{getAverage(rpmHistory).toFixed(0)} RPM</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-600" />
                <h4 className="font-bold text-slate-900">Current Draw History</h4>
              </div>
              <div className="text-sm text-slate-600">
                Max: <span className="font-bold text-amber-600">{getMax(currentHistory).toFixed(2)} A</span>
              </div>
            </div>

            <div className="h-40 flex items-end gap-1 bg-slate-50 rounded-lg p-4">
              {currentHistory.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                  No current data yet
                </div>
              ) : (
                currentHistory.map((current, index) => (
                  <div
                    key={index}
                    className="flex-1 bg-amber-500 rounded-t transition-all hover:bg-amber-600 relative group"
                    style={{ height: `${getBarHeight(current, 2)}%` }}
                  >
                    <div className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {current.toFixed(2)} A
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-2 text-center text-sm text-slate-600">
              Avg: <span className="font-bold text-amber-600">{getAverage(currentHistory).toFixed(2)} A</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 pt-4 border-t-2 border-slate-200">
          <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
            <div className="text-xs text-blue-700 font-semibold mb-1">Peak RPM</div>
            <div className="text-2xl font-bold text-blue-900">{getMax(rpmHistory).toFixed(0)}</div>
          </div>
          <div className="bg-amber-50 rounded-lg p-4 border-2 border-amber-200">
            <div className="text-xs text-amber-700 font-semibold mb-1">Peak Current</div>
            <div className="text-2xl font-bold text-amber-900">{getMax(currentHistory).toFixed(2)} A</div>
          </div>
          <div className="bg-emerald-50 rounded-lg p-4 border-2 border-emerald-200">
            <div className="text-xs text-emerald-700 font-semibold mb-1">Peak Power</div>
            <div className="text-2xl font-bold text-emerald-900">{(getMax(currentHistory) * 5).toFixed(2)} W</div>
          </div>
        </div>
      </div>
    </div>
  );
}

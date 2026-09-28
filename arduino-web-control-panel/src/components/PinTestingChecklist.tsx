import { CheckSquare, Square, PlayCircle, TestTube2, Zap } from 'lucide-react';
import { useState } from 'react';
import { arduinoService } from '../services/arduinoService';

interface PinTest {
  id: string;
  pin: number;
  type: 'digital' | 'analog' | 'pwm';
  description: string;
  tested: boolean;
  passed: boolean | null;
}

interface PinTestingChecklistProps {
  isConnected: boolean;
}

export default function PinTestingChecklist({ isConnected }: PinTestingChecklistProps) {
  const [tests, setTests] = useState<PinTest[]>([
    { id: 'd2', pin: 2, type: 'digital', description: 'Digital Pin 2 - Read/Write', tested: false, passed: null },
    { id: 'd3', pin: 3, type: 'digital', description: 'Digital Pin 3 - Read/Write', tested: false, passed: null },
    { id: 'd4', pin: 4, type: 'digital', description: 'Digital Pin 4 - Read/Write', tested: false, passed: null },
    { id: 'd5', pin: 5, type: 'digital', description: 'Digital Pin 5 - Read/Write', tested: false, passed: null },
    { id: 'd6', pin: 6, type: 'digital', description: 'Digital Pin 6 - Read/Write', tested: false, passed: null },
    { id: 'd7', pin: 7, type: 'digital', description: 'Digital Pin 7 - Read/Write', tested: false, passed: null },
    { id: 'd8', pin: 8, type: 'digital', description: 'Digital Pin 8 - Read/Write', tested: false, passed: null },
    { id: 'd9', pin: 9, type: 'digital', description: 'Digital Pin 9 - Read/Write', tested: false, passed: null },
    { id: 'd13', pin: 13, type: 'digital', description: 'Pin 13 - Built-in LED', tested: false, passed: null },
    { id: 'pwm3', pin: 3, type: 'pwm', description: 'PWM Pin 3 - Analog Write', tested: false, passed: null },
    { id: 'pwm5', pin: 5, type: 'pwm', description: 'PWM Pin 5 - Analog Write', tested: false, passed: null },
    { id: 'pwm6', pin: 6, type: 'pwm', description: 'PWM Pin 6 - Analog Write', tested: false, passed: null },
    { id: 'pwm9', pin: 9, type: 'pwm', description: 'PWM Pin 9 - Analog Write', tested: false, passed: null },
    { id: 'a0', pin: 0, type: 'analog', description: 'Analog Pin A0 - Read', tested: false, passed: null },
    { id: 'a1', pin: 1, type: 'analog', description: 'Analog Pin A1 - Read', tested: false, passed: null },
    { id: 'a2', pin: 2, type: 'analog', description: 'Analog Pin A2 - Read', tested: false, passed: null },
    { id: 'a3', pin: 3, type: 'analog', description: 'Analog Pin A3 - Read', tested: false, passed: null },
    { id: 'a4', pin: 4, type: 'analog', description: 'Analog Pin A4 - Read', tested: false, passed: null },
    { id: 'a5', pin: 5, type: 'analog', description: 'Analog Pin A5 - Read', tested: false, passed: null },
  ]);

  const testPin = async (test: PinTest) => {
    if (!isConnected) {
      alert('Please connect to Arduino first');
      return;
    }

    try {
      if (test.type === 'digital') {
        await arduinoService.digitalWrite(test.pin, 'HIGH');
        await new Promise(resolve => setTimeout(resolve, 200));
        await arduinoService.digitalWrite(test.pin, 'LOW');
        updateTestStatus(test.id, true, true);
      } else if (test.type === 'pwm') {
        await arduinoService.analogWrite(test.pin, 128);
        await new Promise(resolve => setTimeout(resolve, 200));
        await arduinoService.analogWrite(test.pin, 0);
        updateTestStatus(test.id, true, true);
      } else if (test.type === 'analog') {
        await arduinoService.analogRead(test.pin);
        updateTestStatus(test.id, true, true);
      }
    } catch (error) {
      updateTestStatus(test.id, true, false);
    }
  };

  const updateTestStatus = (id: string, tested: boolean, passed: boolean) => {
    setTests(prev => prev.map(t => t.id === id ? { ...t, tested, passed } : t));
  };

  const toggleManualTest = (id: string, passed: boolean) => {
    setTests(tests.map(t => t.id === id ? { ...t, tested: true, passed } : t));
  };

  const resetTests = () => {
    setTests(tests.map(t => ({ ...t, tested: false, passed: null })));
  };

  const testAllPins = async () => {
    if (!isConnected) {
      alert('Please connect to Arduino first');
      return;
    }

    for (const test of tests) {
      await testPin(test);
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  };

  const getTypeIcon = (type: PinTest['type']) => {
    switch (type) {
      case 'digital':
        return '🔌';
      case 'pwm':
        return '📊';
      case 'analog':
        return '📈';
    }
  };

  const getTypeColor = (type: PinTest['type']) => {
    switch (type) {
      case 'digital':
        return 'bg-blue-100 text-blue-700';
      case 'pwm':
        return 'bg-violet-100 text-violet-700';
      case 'analog':
        return 'bg-emerald-100 text-emerald-700';
    }
  };

  const testedCount = tests.filter(t => t.tested).length;
  const passedCount = tests.filter(t => t.passed === true).length;
  const failedCount = tests.filter(t => t.passed === false).length;

  return (
    <div className="bg-white rounded-xl shadow-sm border-2 border-slate-200 overflow-hidden">
      <div className="bg-gradient-to-r from-violet-500 to-purple-500 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TestTube2 className="w-6 h-6 text-white" />
            <div>
              <h2 className="text-xl font-bold text-white">Pin Testing Checklist</h2>
              <p className="text-sm text-violet-50">Verify each pin is functioning correctly</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{testedCount}/{tests.length}</div>
            <div className="text-xs text-violet-100">Pins Tested</div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {testedCount > 0 && (
          <div className="mb-4 grid grid-cols-3 gap-3">
            <div className="p-3 bg-slate-100 rounded-lg text-center">
              <div className="text-2xl font-bold text-slate-700">{testedCount}</div>
              <div className="text-xs text-slate-600">Tested</div>
            </div>
            <div className="p-3 bg-emerald-100 rounded-lg text-center">
              <div className="text-2xl font-bold text-emerald-700">{passedCount}</div>
              <div className="text-xs text-emerald-600">Passed</div>
            </div>
            <div className="p-3 bg-red-100 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-700">{failedCount}</div>
              <div className="text-xs text-red-600">Failed</div>
            </div>
          </div>
        )}

        <div className="flex gap-3 mb-4">
          <button
            onClick={testAllPins}
            disabled={!isConnected}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-violet-600 text-white rounded-lg font-semibold hover:bg-violet-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
          >
            <Zap className="w-5 h-5" />
            Test All Pins
          </button>
          <button
            onClick={resetTests}
            className="px-4 py-3 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-colors"
          >
            Reset
          </button>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {tests.map((test) => (
            <div
              key={test.id}
              className={`p-3 border-2 rounded-lg transition-all ${
                test.tested
                  ? test.passed
                    ? 'bg-emerald-50 border-emerald-300'
                    : 'bg-red-50 border-red-300'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
                  <button
                    onClick={() => {
                      if (test.tested) {
                        toggleManualTest(test.id, !test.passed);
                      }
                    }}
                    className="flex-shrink-0"
                  >
                    {test.tested ? (
                      test.passed ? (
                        <CheckSquare className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <CheckSquare className="w-5 h-5 text-red-600" />
                      )
                    ) : (
                      <Square className="w-5 h-5 text-slate-400" />
                    )}
                  </button>
                  <span className="text-lg">{getTypeIcon(test.type)}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">{test.description}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getTypeColor(test.type)}`}>
                        {test.type.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => testPin(test)}
                  disabled={!isConnected}
                  className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold hover:bg-blue-200 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                >
                  <PlayCircle className="w-4 h-4" />
                  Test
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

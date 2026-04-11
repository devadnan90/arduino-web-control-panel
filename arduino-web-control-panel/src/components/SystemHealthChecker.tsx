import { PlayCircle, Loader2, CheckCircle2, XCircle, AlertCircle, Activity } from 'lucide-react';
import { useState } from 'react';
import { DiagnosticTest, diagnosticTests } from '../services/diagnosticsService';
import { arduinoService } from '../services/arduinoService';

interface SystemHealthCheckerProps {
  isConnected: boolean;
}

export default function SystemHealthChecker({ isConnected }: SystemHealthCheckerProps) {
  const [tests, setTests] = useState<DiagnosticTest[]>(diagnosticTests);
  const [isRunning, setIsRunning] = useState(false);

  const getStatusIcon = (status: DiagnosticTest['status']) => {
    switch (status) {
      case 'pending':
        return <div className="w-5 h-5 rounded-full border-2 border-slate-300" />;
      case 'running':
        return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
      case 'passed':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-amber-600" />;
    }
  };

  const getStatusColor = (status: DiagnosticTest['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-slate-50 border-slate-200';
      case 'running':
        return 'bg-blue-50 border-blue-300';
      case 'passed':
        return 'bg-emerald-50 border-emerald-300';
      case 'failed':
        return 'bg-red-50 border-red-300';
      case 'warning':
        return 'bg-amber-50 border-amber-300';
    }
  };

  const getCategoryIcon = (category: DiagnosticTest['category']) => {
    const icons = {
      pin: '📌',
      connection: '🔌',
      power: '⚡',
      communication: '💬'
    };
    return icons[category];
  };

  const runAllTests = async () => {
    if (!isConnected) {
      alert('Please connect to Arduino first');
      return;
    }

    setIsRunning(true);
    const updatedTests = [...tests];

    for (let i = 0; i < updatedTests.length; i++) {
      updatedTests[i].status = 'running';
      setTests([...updatedTests]);

      await new Promise(resolve => setTimeout(resolve, 800));

      try {
        const testResult = await runSingleTest(updatedTests[i]);
        updatedTests[i] = testResult;
      } catch (error) {
        updatedTests[i].status = 'failed';
        updatedTests[i].result = 'Test failed to execute';
      }

      setTests([...updatedTests]);
    }

    setIsRunning(false);
  };

  const runSingleTest = async (test: DiagnosticTest): Promise<DiagnosticTest> => {
    const updatedTest = { ...test };

    switch (test.id) {
      case 'serial-connection':
        if (isConnected) {
          updatedTest.status = 'passed';
          updatedTest.result = 'Serial connection active';
        } else {
          updatedTest.status = 'failed';
          updatedTest.result = 'No serial connection';
        }
        break;

      case 'handshake':
        try {
          await arduinoService.sendCommand('PING');
          updatedTest.status = 'passed';
          updatedTest.result = 'Communication successful';
        } catch {
          updatedTest.status = 'warning';
          updatedTest.result = 'Command sent but no response';
        }
        break;

      case 'digital-write':
        try {
          await arduinoService.digitalWrite(13, 'HIGH');
          await new Promise(resolve => setTimeout(resolve, 200));
          await arduinoService.digitalWrite(13, 'LOW');
          updatedTest.status = 'passed';
          updatedTest.result = 'Digital write successful on pin 13';
        } catch {
          updatedTest.status = 'failed';
          updatedTest.result = 'Digital write failed';
        }
        break;

      case 'digital-read':
        try {
          await arduinoService.digitalRead(2);
          updatedTest.status = 'passed';
          updatedTest.result = 'Digital read command sent';
        } catch {
          updatedTest.status = 'failed';
          updatedTest.result = 'Digital read failed';
        }
        break;

      case 'analog-read':
        try {
          await arduinoService.analogRead(0);
          updatedTest.status = 'passed';
          updatedTest.result = 'Analog read command sent';
        } catch {
          updatedTest.status = 'failed';
          updatedTest.result = 'Analog read failed';
        }
        break;

      case 'pwm-output':
        try {
          await arduinoService.analogWrite(9, 128);
          await new Promise(resolve => setTimeout(resolve, 200));
          await arduinoService.analogWrite(9, 0);
          updatedTest.status = 'passed';
          updatedTest.result = 'PWM output successful';
        } catch {
          updatedTest.status = 'failed';
          updatedTest.result = 'PWM output failed';
        }
        break;

      case 'response-time':
        const startTime = Date.now();
        try {
          await arduinoService.sendCommand('TEST');
          const responseTime = Date.now() - startTime;
          if (responseTime < 100) {
            updatedTest.status = 'passed';
            updatedTest.result = `Response time: ${responseTime}ms (excellent)`;
          } else if (responseTime < 500) {
            updatedTest.status = 'warning';
            updatedTest.result = `Response time: ${responseTime}ms (acceptable)`;
          } else {
            updatedTest.status = 'warning';
            updatedTest.result = `Response time: ${responseTime}ms (slow)`;
          }
        } catch {
          updatedTest.status = 'failed';
          updatedTest.result = 'No response received';
        }
        break;

      case 'power-status':
        if (isConnected) {
          updatedTest.status = 'passed';
          updatedTest.result = 'Board powered and responding';
        } else {
          updatedTest.status = 'failed';
          updatedTest.result = 'Cannot verify power status';
        }
        break;

      default:
        updatedTest.status = 'warning';
        updatedTest.result = 'Test not implemented';
    }

    return updatedTest;
  };

  const resetTests = () => {
    setTests(diagnosticTests.map(t => ({ ...t, status: 'pending', result: undefined })));
  };

  const passedCount = tests.filter(t => t.status === 'passed').length;
  const failedCount = tests.filter(t => t.status === 'failed').length;
  const warningCount = tests.filter(t => t.status === 'warning').length;

  return (
    <div className="bg-white rounded-xl shadow-sm border-2 border-slate-200 overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-white" />
            <div>
              <h2 className="text-xl font-bold text-white">System Health Check</h2>
              <p className="text-sm text-emerald-50">Verify all Arduino functions are working</p>
            </div>
          </div>
          {(passedCount > 0 || failedCount > 0 || warningCount > 0) && (
            <div className="flex gap-3 text-sm">
              {passedCount > 0 && (
                <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span className="text-white font-semibold">{passedCount}</span>
                </div>
              )}
              {warningCount > 0 && (
                <div className="flex items-center gap-1 bg-amber-500/40 px-3 py-1 rounded-full">
                  <AlertCircle className="w-4 h-4 text-white" />
                  <span className="text-white font-semibold">{warningCount}</span>
                </div>
              )}
              {failedCount > 0 && (
                <div className="flex items-center gap-1 bg-red-500/40 px-3 py-1 rounded-full">
                  <XCircle className="w-4 h-4 text-white" />
                  <span className="text-white font-semibold">{failedCount}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="p-6">
        <div className="flex gap-3 mb-4">
          <button
            onClick={runAllTests}
            disabled={!isConnected || isRunning}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Running Tests...
              </>
            ) : (
              <>
                <PlayCircle className="w-5 h-5" />
                Run All Tests
              </>
            )}
          </button>
          <button
            onClick={resetTests}
            disabled={isRunning}
            className="px-4 py-3 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Reset
          </button>
        </div>

        {!isConnected && (
          <div className="mb-4 p-3 bg-amber-50 border-2 border-amber-300 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <p className="text-sm text-amber-900 font-medium">Connect to Arduino to run diagnostics</p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {tests.map((test) => (
            <div
              key={test.id}
              className={`p-4 border-2 rounded-lg transition-all ${getStatusColor(test.status)}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  {getStatusIcon(test.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getCategoryIcon(test.category)}</span>
                      <h4 className="font-semibold text-slate-900 text-sm">{test.name}</h4>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{test.description}</p>
                    {test.result && (
                      <p className="text-xs text-slate-700 mt-2 font-medium bg-white px-2 py-1 rounded border border-slate-200">
                        {test.result}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

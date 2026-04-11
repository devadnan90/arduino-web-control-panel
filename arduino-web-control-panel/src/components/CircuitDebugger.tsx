import { AlertTriangle, CheckCircle, Info, Wrench, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';
import { useState } from 'react';
import { commonCircuitIssues, CircuitIssue, debuggingTips } from '../services/diagnosticsService';

export default function CircuitDebugger() {
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null);
  const [showTips, setShowTips] = useState(false);

  const getSeverityIcon = (severity: CircuitIssue['severity']) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getSeverityColor = (severity: CircuitIssue['severity']) => {
    switch (severity) {
      case 'critical':
        return 'border-red-300 bg-red-50';
      case 'warning':
        return 'border-amber-300 bg-amber-50';
      case 'info':
        return 'border-blue-300 bg-blue-50';
    }
  };

  const getCategoryBadge = (category: CircuitIssue['category']) => {
    const colors = {
      hardware: 'bg-orange-100 text-orange-700',
      software: 'bg-blue-100 text-blue-700',
      connection: 'bg-violet-100 text-violet-700'
    };
    return colors[category];
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border-2 border-slate-200 overflow-hidden">
      <div className="bg-gradient-to-r from-red-500 to-orange-500 px-6 py-4">
        <div className="flex items-center gap-3">
          <Wrench className="w-6 h-6 text-white" />
          <div>
            <h2 className="text-xl font-bold text-white">Circuit Debugger</h2>
            <p className="text-sm text-red-50">Common issues and troubleshooting solutions</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <button
          onClick={() => setShowTips(!showTips)}
          className="w-full flex items-center justify-between p-4 bg-blue-50 border-2 border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Lightbulb className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-blue-900">Debugging Tips & Best Practices</span>
          </div>
          {showTips ? <ChevronUp className="w-5 h-5 text-blue-600" /> : <ChevronDown className="w-5 h-5 text-blue-600" />}
        </button>

        {showTips && (
          <div className="grid md:grid-cols-2 gap-3 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
            {debuggingTips.map((tip, index) => (
              <div key={index} className="flex gap-2 items-start">
                <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-blue-900">{tip.title}</p>
                  <p className="text-xs text-blue-700">{tip.tip}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-3">
          <h3 className="font-semibold text-slate-900 text-sm uppercase tracking-wide">Common Issues</h3>
          {commonCircuitIssues.map((issue) => (
            <div
              key={issue.id}
              className={`border-2 rounded-lg overflow-hidden transition-all ${getSeverityColor(issue.severity)}`}
            >
              <button
                onClick={() => setExpandedIssue(expandedIssue === issue.id ? null : issue.id)}
                className="w-full px-4 py-3 flex items-center justify-between hover:opacity-80 transition-opacity"
              >
                <div className="flex items-center gap-3">
                  {getSeverityIcon(issue.severity)}
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-slate-900 text-sm">{issue.title}</h4>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getCategoryBadge(issue.category)}`}>
                        {issue.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 mt-0.5">{issue.description}</p>
                  </div>
                </div>
                {expandedIssue === issue.id ? (
                  <ChevronUp className="w-5 h-5 text-slate-600 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-600 flex-shrink-0" />
                )}
              </button>

              {expandedIssue === issue.id && (
                <div className="px-4 pb-4 border-t-2 border-slate-200 bg-white">
                  <p className="text-sm font-semibold text-slate-900 mt-3 mb-2">Solutions:</p>
                  <ul className="space-y-2">
                    {issue.solutions.map((solution, index) => (
                      <li key={index} className="flex gap-2 items-start">
                        <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-slate-700">{solution}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Code2, Upload, Download, CheckCircle, XCircle, Search, Filter, ChevronDown, ChevronUp, Copy, RotateCcw, Zap } from 'lucide-react';
import { codeSnippets, CodeSnippet, getCategoryIcon, getDifficultyColor } from '../services/codeSnippetsLibrary';
import { arduinoService } from '../services/arduinoService';
import { codeUploadService, UploadProgress } from '../services/codeUploadService';
import UploadProgressModal from './UploadProgressModal';

interface CodeManagerProps {
  isConnected: boolean;
  onReset: () => void;
}

export default function CodeManager({ isConnected, onReset }: CodeManagerProps) {
  const [snippets, setSnippets] = useState<CodeSnippet[]>(codeSnippets);
  const [expandedSnippet, setExpandedSnippet] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadToArduino = async (snippetId: string) => {
    const snippet = snippets.find(s => s.id === snippetId);
    if (!snippet) return;

    if (!isConnected) {
      alert('Please connect to Arduino first!');
      return;
    }

    setIsUploading(true);
    codeUploadService.setProgressCallback(setUploadProgress);

    const port = arduinoService.getPort();
    if (!port) {
      alert('Connection lost. Please reconnect.');
      setIsUploading(false);
      return;
    }

    try {
      await arduinoService.pauseStreams();
      await new Promise(resolve => setTimeout(resolve, 100));

      const success = await codeUploadService.uploadCode(port, snippet.code);

      if (success) {
        setSnippets(snippets.map(s =>
          s.id === snippetId ? { ...s, deployed: true } : s
        ));
      }

      await new Promise(resolve => setTimeout(resolve, 500));
      await arduinoService.resumeStreams();
    } catch (error) {
      console.error('Upload error:', error);
      await arduinoService.resumeStreams();
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeploy = async (snippetId: string) => {
    const snippet = snippets.find(s => s.id === snippetId);
    if (!snippet) return;

    const blob = new Blob([snippet.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${snippet.id}.ino`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setSnippets(snippets.map(s =>
      s.id === snippetId ? { ...s, deployed: true } : s
    ));
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    alert('Code copied to clipboard!');
  };

  const filteredSnippets = snippets.filter(snippet => {
    const matchesSearch = snippet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         snippet.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || snippet.category === filterCategory;
    const matchesDifficulty = filterDifficulty === 'all' || snippet.difficulty === filterDifficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const deployedCount = snippets.filter(s => s.deployed).length;

  return (
    <div className="bg-white rounded-xl shadow-sm border-2 border-slate-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Code2 className="w-6 h-6 text-white" />
            <div>
              <h2 className="text-xl font-bold text-white">Code Library</h2>
              <p className="text-sm text-blue-50">Ready-to-use Arduino sketches for experiments</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-2xl font-bold text-white">{snippets.length}</div>
              <div className="text-xs text-blue-100">Sketches</div>
            </div>
            <button
              onClick={onReset}
              disabled={!isConnected}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Arduino
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-4 space-y-3">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search sketches..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-600" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-1.5 border-2 border-slate-200 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="all">All Categories</option>
                <option value="basic">Basic</option>
                <option value="sensor">Sensors</option>
                <option value="display">Display</option>
                <option value="motor">Motors</option>
                <option value="communication">Communication</option>
              </select>
            </div>

            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="px-3 py-1.5 border-2 border-slate-200 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>

            {deployedCount > 0 && (
              <div className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium">
                <CheckCircle className="w-4 h-4" />
                {deployedCount} Deployed
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {filteredSnippets.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Code2 className="w-12 h-12 mx-auto mb-3 text-slate-400" />
              <p>No sketches found matching your criteria</p>
            </div>
          ) : (
            filteredSnippets.map((snippet) => (
              <div
                key={snippet.id}
                className={`border-2 rounded-lg overflow-hidden transition-all ${
                  snippet.deployed
                    ? 'border-emerald-300 bg-emerald-50'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <span className="text-2xl">{getCategoryIcon(snippet.category)}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-slate-900">{snippet.name}</h3>
                          {snippet.deployed && (
                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                          )}
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{snippet.description}</p>
                        <div className="flex gap-2 flex-wrap">
                          <span className={`text-xs px-2 py-1 rounded border font-medium ${getDifficultyColor(snippet.difficulty)}`}>
                            {snippet.difficulty}
                          </span>
                          <span className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-700 border border-slate-300 font-medium">
                            {snippet.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {isConnected && (
                        <button
                          onClick={() => handleUploadToArduino(snippet.id)}
                          disabled={isUploading}
                          className="px-4 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-lg text-sm font-bold hover:from-violet-700 hover:to-fuchsia-700 transition-all flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Zap className="w-4 h-4" />
                          Upload Now
                        </button>
                      )}
                      <button
                        onClick={() => handleCopyCode(snippet.code)}
                        className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-200 transition-colors flex items-center gap-1"
                      >
                        <Copy className="w-4 h-4" />
                        Copy
                      </button>
                      <button
                        onClick={() => handleDeploy(snippet.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center gap-1"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                      <button
                        onClick={() => setExpandedSnippet(expandedSnippet === snippet.id ? null : snippet.id)}
                        className="px-2 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                      >
                        {expandedSnippet === snippet.id ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {expandedSnippet === snippet.id && (
                    <div className="mt-4 space-y-4 border-t-2 border-slate-200 pt-4">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 mb-2">Components Required:</h4>
                        <ul className="space-y-1">
                          {snippet.components.map((component, index) => (
                            <li key={index} className="text-sm text-slate-700 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                              {component}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-slate-900 mb-2">Wiring Connections:</h4>
                        <ul className="space-y-1">
                          {snippet.wiring.map((wire, index) => (
                            <li key={index} className="text-sm text-slate-700 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></span>
                              <code className="bg-slate-100 px-2 py-0.5 rounded text-xs">{wire}</code>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-slate-900 mb-2">Code:</h4>
                        <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                          <pre className="text-xs text-slate-100 font-mono">{snippet.code}</pre>
                        </div>
                      </div>

                      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3">
                        <p className="text-xs text-blue-900">
                          <strong>How to use:</strong> {isConnected ? 'Click "Upload Now" to deploy directly to Arduino, or download the .ino file for manual upload.' : 'Connect to Arduino first, then click "Upload Now" for instant deployment.'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <UploadProgressModal
        progress={uploadProgress}
        onClose={() => setUploadProgress(null)}
      />
    </div>
  );
}

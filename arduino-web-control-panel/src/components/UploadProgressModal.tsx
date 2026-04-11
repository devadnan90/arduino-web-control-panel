import { CheckCircle, XCircle, Loader, Upload, Code, FileCheck } from 'lucide-react';
import { UploadProgress } from '../services/codeUploadService';

interface UploadProgressModalProps {
  progress: UploadProgress | null;
  onClose: () => void;
}

export default function UploadProgressModal({ progress, onClose }: UploadProgressModalProps) {
  if (!progress) return null;

  const getIcon = () => {
    switch (progress.stage) {
      case 'compiling':
        return <Code className="w-12 h-12 text-blue-600 animate-pulse" />;
      case 'uploading':
        return <Upload className="w-12 h-12 text-violet-600 animate-bounce" />;
      case 'verifying':
        return <FileCheck className="w-12 h-12 text-amber-600 animate-pulse" />;
      case 'complete':
        return <CheckCircle className="w-12 h-12 text-green-600" />;
      case 'error':
        return <XCircle className="w-12 h-12 text-red-600" />;
    }
  };

  const getStageColor = () => {
    switch (progress.stage) {
      case 'compiling':
        return 'bg-blue-600';
      case 'uploading':
        return 'bg-violet-600';
      case 'verifying':
        return 'bg-amber-600';
      case 'complete':
        return 'bg-green-600';
      case 'error':
        return 'bg-red-600';
    }
  };

  const getStageText = () => {
    switch (progress.stage) {
      case 'compiling':
        return 'Compiling';
      case 'uploading':
        return 'Uploading';
      case 'verifying':
        return 'Verifying';
      case 'complete':
        return 'Complete';
      case 'error':
        return 'Error';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className={`${getStageColor()} px-6 py-4`}>
          <h2 className="text-xl font-bold text-white">Code Upload</h2>
        </div>

        <div className="p-8">
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              {getIcon()}
              {(progress.stage === 'compiling' || progress.stage === 'uploading' || progress.stage === 'verifying') && (
                <Loader className="w-16 h-16 text-slate-300 absolute -top-2 -left-2 animate-spin" />
              )}
            </div>

            <div className="w-full">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-slate-700">{getStageText()}</span>
                <span className="text-sm font-bold text-slate-700">{progress.percentage}%</span>
              </div>

              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full ${getStageColor()} transition-all duration-500 ease-out`}
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>

              <p className="text-center mt-4 text-slate-600 font-medium">
                {progress.message}
              </p>
            </div>

            {progress.stage === 'complete' && (
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 w-full">
                <p className="text-green-800 font-semibold text-center">
                  Your code is now running on the Arduino!
                </p>
              </div>
            )}

            {progress.stage === 'error' && (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 w-full">
                <p className="text-red-800 font-semibold text-sm text-center">
                  {progress.message}
                </p>
              </div>
            )}

            {(progress.stage === 'complete' || progress.stage === 'error') && (
              <button
                onClick={onClose}
                className={`px-6 py-3 rounded-lg font-bold text-white transition-colors w-full ${
                  progress.stage === 'complete'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Close
              </button>
            )}
          </div>
        </div>

        {progress.stage !== 'complete' && progress.stage !== 'error' && (
          <div className="bg-slate-50 px-6 py-3 border-t-2 border-slate-200">
            <p className="text-xs text-slate-500 text-center">
              Please keep this window open during upload
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

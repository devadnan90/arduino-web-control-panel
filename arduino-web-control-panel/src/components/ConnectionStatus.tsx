import { Usb, WifiOff, CheckCircle2, AlertCircle } from 'lucide-react';

interface ConnectionStatusProps {
  isSupported: boolean;
  isConnected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

export default function ConnectionStatus({
  isSupported,
  isConnected,
  onConnect,
  onDisconnect
}: ConnectionStatusProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center gap-4">
          <div className={`relative p-3 rounded-lg ${isConnected ? 'bg-emerald-100' : 'bg-slate-100'}`}>
            {isConnected ? (
              <>
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              </>
            ) : (
              <Usb className="w-6 h-6 text-slate-600" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-slate-900">
                {isConnected ? 'Arduino Connected' : 'Arduino Connection'}
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                isConnected
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {isConnected ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>
            <p className="text-sm text-slate-600 mt-1">
              {!isSupported
                ? 'Web Serial API not supported in this browser'
                : isConnected
                  ? 'Device ready to receive commands via USB'
                  : 'No device connected. Click the button to connect.'}
            </p>
          </div>
        </div>

        {isSupported && (
          <button
            onClick={isConnected ? onDisconnect : onConnect}
            className={`px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 ${
              isConnected
                ? 'bg-red-600 text-white hover:bg-red-700 shadow-md'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
            }`}
          >
            {isConnected ? 'Disconnect' : 'Connect USB'}
          </button>
        )}
      </div>

      {isConnected && (
        <div className="px-6 pb-4 flex items-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="text-slate-600">Baud Rate: 9600</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-slate-600">Protocol: Serial</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-violet-500"></div>
            <span className="text-slate-600">Status: Active</span>
          </div>
        </div>
      )}

      {!isSupported && (
        <div className="mx-6 mb-6 flex items-start gap-3 p-4 bg-amber-50 border-2 border-amber-300 rounded-lg">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-amber-900 font-semibold">Browser Not Supported</p>
            <p className="text-xs text-amber-700 mt-1">
              Web Serial API is required for USB communication. Please use Chrome, Edge, or Opera browser.
            </p>
          </div>
        </div>
      )}

      {!isConnected && isSupported && (
        <div className="mx-6 mb-6 flex items-start gap-3 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
          <Usb className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-blue-900 font-semibold">Ready to Connect</p>
            <p className="text-xs text-blue-700 mt-1">
              Click "Connect USB" and select your Arduino from the list. Make sure your Arduino has the sketch uploaded.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

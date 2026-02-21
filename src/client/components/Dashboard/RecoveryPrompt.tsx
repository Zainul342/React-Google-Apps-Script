import React from 'react';

interface RecoveryPromptProps {
  onAccept: () => void;
  onDecline: () => void;
}

const RecoveryPrompt: React.FC<RecoveryPromptProps> = ({ onAccept, onDecline }) => {
  return (
    <div className="mx-4 my-2 p-4 bg-emerald-50 border border-emerald-100 rounded-xl shadow-sm animate-in slide-in-from-top duration-700">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-emerald-900 mb-1">Welcome back!</h3>
          <p className="text-xs text-emerald-700 leading-relaxed mb-3">
            Sepertinya Anda mengambil waktu istirahat sejenak. Ingin mengaktifkan <strong>Recovery Mode</strong> hari ini? Target akan dipermudah agar Anda bisa kembali ke rutinitas tanpa beban.
          </p>
          <div className="flex space-x-2">
            <button
              onClick={onAccept}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
            >
              Ya, Aktifkan
            </button>
            <button
              onClick={onDecline}
              className="px-3 py-1.5 bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold rounded-lg transition-colors"
            >
              Nanti Saja
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecoveryPrompt;

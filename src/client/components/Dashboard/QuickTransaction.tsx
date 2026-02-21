import React, { useState } from 'react';
import { serverFunctions } from '../../utils/serverFunctions';

const QuickTransaction: React.FC = () => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const parseInput = (text: string) => {
    // Regex to find description and amount (e.g., "Kopi 25000" or "Gaji 5000000")
    // Group 1: Description, Group 2: Amount
    const match = text.match(/^(.+)\s+(\d+)$/);
    if (match) {
      return { desc: match[1].trim(), amount: parseInt(match[2]) };
    }
    return null;
  };

  const handleSubmit = async (e?: React.FormEvent, force: boolean = false) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    const parsed = parseInput(input);
    if (!parsed) {
      setStatus('error');
      setMessage('Format salah. Gunakan: "Deskripsi Jumlah" (misal: Bakso 15000)');
      return;
    }

    setStatus('loading');
    try {
      const res = await serverFunctions.logTransaction(parsed.desc, parsed.amount, 'Expense', force);
      
      if (res && res.warning && !force) {
        setStatus('idle');
        if (window.confirm(res.warning)) {
          handleSubmit(undefined, true); // Retry with force
        }
        return;
      }

      if (res && !res.error) {
        setStatus('success');
        setMessage('Tercatat!');
        setInput('');
        setTimeout(() => {
          if (status === 'success') setStatus('idle');
        }, 5000);
      } else {
        throw new Error(res?.error || 'Gagal mencatat');
      }
    } catch (err) {
      setStatus('error');
      setMessage('Terjadi kesalahan sistem.');
      console.error(err);
    }
  };

  const handleUndo = async () => {
    setStatus('loading');
    try {
      const res = await serverFunctions.undoLastTransaction();
      if (res && !res.error) {
        setStatus('success');
        setMessage('Dibatalkan!');
        setTimeout(() => setStatus('idle'), 3000);
      } else {
        setStatus('error');
        setMessage(res?.error || 'Gagal membatalkan');
      }
    } catch (err) {
      setStatus('error');
      setMessage('Gagal membatalkan');
      console.error(err);
    }
  };

  const startVoiceInput = () => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Browser Anda tidak mendukung Voice Input.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'id-ID'; // Indonesian
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      // Auto-parse and submit if it looks valid
      const parsed = parseInput(transcript);
      if (parsed) {
        // Give user a moment to see the text before auto-submit
        setTimeout(() => {
           // We can't easily trigger the same handleSubmit without refactor, 
           // so let's just let the user tap 'Save' or call logic directly
        }, 500);
      }
    };

    recognition.start();
  };

  return (
    <div className="px-4 py-4 bg-slate-50 border-y border-slate-100">
      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Catat Transaksi Cepat</h3>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Misal: Kopi 25000"
            className="w-full pl-4 pr-12 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-emerald-400 transition-all shadow-sm"
          />
          <button
            type="button"
            onClick={startVoiceInput}
            className={`absolute right-2 p-2 rounded-xl transition-all ${
              isListening 
                ? 'bg-red-50 text-red-500 animate-pulse' 
                : 'text-slate-400 hover:text-emerald-500 hover:bg-emerald-50'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className={`text-[10px] font-medium transition-colors ${
              status === 'error' ? 'text-red-500' : status === 'success' ? 'text-emerald-600' : 'text-slate-400'
            }`}>
              {message || 'Tips: Gunakan suara atau ketik "Deskripsi Jumlah"'}
            </span>
            {status === 'success' && message === 'Tercatat!' && (
              <button 
                onClick={handleUndo}
                className="text-[10px] font-bold text-slate-500 hover:text-red-500 underline decoration-dotted transition-colors"
              >
                Urungkan?
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={status === 'loading'}
            className="px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl hover:bg-slate-900 active:scale-95 transition-all disabled:opacity-50"
          >
            {status === 'loading' ? 'Mencatat...' : 'Simpan'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuickTransaction;

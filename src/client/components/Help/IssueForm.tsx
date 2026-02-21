import React, { useState } from 'react';

interface IssueFormProps {
  onBack: () => void;
}

const IssueForm: React.FC<IssueFormProps> = ({ onBack }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    email: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description) return;

    setLoading(true);
    // @ts-ignore
    google.script.run
      .withSuccessHandler(() => {
        setLoading(false);
        setSuccess(true);
      })
      .submitTechnicalIssue(formData);
  };

  if (success) {
    return (
      <div className="p-6 text-center animate-in fade-in zoom-in duration-300">
        <div className="text-5xl mb-4">✨</div>
        <h2 className="text-xl font-bold text-emerald-800 mb-2">Laporan Terkirim!</h2>
        <p className="text-sm text-slate-600 mb-6">Terima kasih atas masukannya. Kami akan meninjau laporan Anda segera.</p>
        <button 
          onClick={onBack}
          className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition-colors"
        >
          Kembali ke Bantuan
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 animate-in slide-in-from-bottom duration-300">
      <div className="flex items-center mb-4">
        <button onClick={onBack} className="mr-2 text-slate-400 hover:text-slate-600">←</button>
        <h2 className="text-lg font-bold text-slate-800">Laporkan Masalah</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Subjek</label>
          <input 
            type="text"
            className="w-full p-2 border rounded border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
            placeholder="Misal: Rumus error, Sidebar lambat"
            value={formData.subject}
            onChange={e => setFormData({...formData, subject: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Deskripsi *</label>
          <textarea 
            required
            className="w-full p-2 border rounded border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none text-sm h-32"
            placeholder="Ceritakan apa yang terjadi..."
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Email Kontak (Opsional)</label>
          <input 
            type="email"
            className="w-full p-2 border rounded border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
            placeholder="agar kami bisa membalas Anda"
            value={formData.email}
            onChange={e => setFormData({...formData, email: e.target.value})}
          />
        </div>

        <button 
          type="submit"
          disabled={loading || !formData.description}
          className={`w-full py-2 rounded-lg text-white font-semibold transition-all ${loading ? 'bg-slate-400' : 'bg-emerald-600 hover:bg-emerald-700'}`}
        >
          {loading ? 'Mengirim...' : 'Kirim Laporan'}
        </button>
      </form>
    </div>
  );
};

export default IssueForm;

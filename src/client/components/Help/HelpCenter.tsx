import React, { useState } from 'react';
import { FAQ_DATA } from '../../constants/help-content';
import FAQItem from './FAQItem';
import IssueForm from './IssueForm';

const HelpCenter: React.FC = () => {
  const [search, setSearch] = useState('');
  const [showIssueForm, setShowIssueForm] = useState(false);

  const filteredFAQ = FAQ_DATA.filter(item => 
    item.question.toLowerCase().includes(search.toLowerCase()) || 
    item.answer.toLowerCase().includes(search.toLowerCase())
  );

  if (showIssueForm) {
    return <IssueForm onBack={() => setShowIssueForm(false)} />;
  }

  return (
    <div className="p-4 bg-slate-50 min-h-screen font-sans">
      <h1 className="text-xl font-bold text-emerald-800 mb-4">Pusat Bantuan</h1>
      
      <div className="mb-6">
        <input
          type="text"
          placeholder="Cari bantuan..."
          className="w-full p-2 border rounded-full border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-1">
        {filteredFAQ.length > 0 ? (
          filteredFAQ.map((item, idx) => (
            <FAQItem key={idx} {...item} />
          ))
        ) : (
          <p className="text-sm text-slate-500 italic text-center py-4">
            Tidak ada hasil ditemukan.
          </p>
        )}
      </div>

      <div className="mt-10 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
        <h3 className="text-sm font-semibold text-emerald-900 mb-1">Butuh bantuan lebih lanjut?</h3>
        <p className="text-xs text-emerald-700 mb-3">Tim kami siap membantu masalah teknis Anda.</p>
        <button 
          onClick={() => setShowIssueForm(true)}
          className="w-full bg-emerald-600 text-white text-xs py-2 rounded-lg hover:bg-emerald-700 transition-colors"
        >
          Laporkan Masalah
        </button>
      </div>
    </div>
  );
};

export default HelpCenter;

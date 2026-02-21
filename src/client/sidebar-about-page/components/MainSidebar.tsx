import React, { useState, useEffect } from 'react';
import HelpCenter from '../../components/Help/HelpCenter';
import HarmonyDashboard from '../../components/Dashboard/HarmonyDashboard';
import RecoveryPrompt from '../../components/Dashboard/RecoveryPrompt';
import { serverFunctions } from '../../utils/serverFunctions';

const MainSidebar: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [showRecovery, setShowRecovery] = useState(false);

  useEffect(() => {
    // Check for recovery status on load
    serverFunctions.getRecoveryStatus().then((response) => {
      if (response && response.needsRecovery) {
        setShowRecovery(true);
      }
    }).catch(err => console.error('Failed to fetch recovery status:', err));
  }, []);

  const handleAcceptRecovery = () => {
    serverFunctions.setRecoveryMode(true).then(() => {
      setShowRecovery(false);
      // Optional: Refresh habit list or show success state
      window.location.reload(); // Force refresh to apply recovery UI changes if needed
    }).catch(err => console.error('Failed to set recovery mode:', err));
  };

  const handleDeclineRecovery = () => {
    serverFunctions.setRecoveryMode(false).then(() => {
      setShowRecovery(false);
    }).catch(err => console.error('Failed to decline recovery mode:', err));
  };

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 bg-slate-50">
        <button 
          onClick={() => setActiveTab('home')}
          className={`flex-1 py-3 text-xs font-semibold ${activeTab === 'home' ? 'text-emerald-700 border-b-2 border-emerald-600 bg-white' : 'text-slate-500'}`}
        >
          Dashboard
        </button>
        <button 
          onClick={() => setActiveTab('help')}
          className={`flex-1 py-3 text-xs font-semibold ${activeTab === 'help' ? 'text-emerald-700 border-b-2 border-emerald-600 bg-white' : 'text-slate-500'}`}
        >
          Bantuan
        </button>
        <button 
          onClick={() => setActiveTab('about')}
          className={`flex-1 py-3 text-xs font-semibold ${activeTab === 'about' ? 'text-emerald-700 border-b-2 border-emerald-600 bg-white' : 'text-slate-500'}`}
        >
          Tentang
        </button>
      </div>

      {/* Recovery Prompt */}
      {showRecovery && activeTab === 'home' && (
        <RecoveryPrompt 
          onAccept={handleAcceptRecovery}
          onDecline={handleDeclineRecovery}
        />
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'home' && <HarmonyDashboard />}

        {activeTab === 'help' && <HelpCenter />}

        {activeTab === 'about' && (
          <div className="p-6 text-slate-700 space-y-4">
            <h2 className="text-lg font-bold text-emerald-800">Harmony Tracker v1.0</h2>
            <p className="text-sm leading-relaxed">
              Dibuat khusus untuk profesional yang ingin produktif tanpa rasa bersalah.
            </p>
            <div className="pt-4 border-t border-slate-100 text-xs text-slate-500">
              © 2026 Zainmutaqin Digital.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainSidebar;

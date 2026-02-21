import React from 'react';

interface HabitItemProps {
  name: string;
  mini?: string;
  plus?: string;
  elite?: string;
  isCompleted: boolean;
  completedLevel?: string;
  onLog: (name: string, level: string) => void;
  isRecoveryMode?: boolean;
}

const HabitItem: React.FC<HabitItemProps> = ({ name, mini, plus, elite, isCompleted, completedLevel, onLog, isRecoveryMode }) => {
  const [showLevels, setShowLevels] = React.useState(false);

  const handleLevelClick = (e: React.MouseEvent, level: string) => {
    e.stopPropagation();
    onLog(name, level);
    setShowLevels(false);
  };

  const getLevelBadgeColor = (level?: string) => {
    switch(level) {
      case 'Elite': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Plus': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div className="mb-3">
      <button
        disabled={isCompleted}
        onClick={() => !isCompleted && setShowLevels(!showLevels)}
        className={`w-full flex items-center p-4 rounded-2xl border transition-all duration-500 transform active:scale-95 ${
          isCompleted 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
            : showLevels
              ? 'bg-white border-emerald-400 shadow-sm'
              : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-300 hover:shadow-md'
        }`}
      >
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 transition-colors ${
          isCompleted ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'
        }`}>
          {isCompleted && <span className="text-white text-xs">✓</span>}
        </div>
        <div className="flex-1 flex flex-col items-start">
          <span className={`font-medium text-left ${isCompleted ? 'line-through opacity-60' : ''}`}>
            {name}
          </span>
          {isRecoveryMode && !isCompleted && (
            <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-tight">
              Recovery Goal: Mini
            </span>
          )}
        </div>
        {isCompleted ? (
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${getLevelBadgeColor(completedLevel)}`}>
            {completedLevel || 'Mini'}
          </span>
        ) : (
          <div className="flex items-center space-x-1">
             <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full uppercase tracking-wider">
              {showLevels ? 'Cancel' : 'Log'}
            </span>
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-slate-400 transition-transform ${showLevels ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        )}
      </button>

      {/* Level Selection Dropdown */}
      {!isCompleted && showLevels && (
        <div className="mt-2 mx-2 p-2 bg-slate-50 border border-slate-100 rounded-xl flex flex-col space-y-1 animate-in slide-in-from-top-2 duration-300">
          <button 
            onClick={(e) => handleLevelClick(e, 'Mini')}
            className={`flex items-center justify-between p-3 rounded-lg hover:bg-white transition-colors border border-transparent hover:border-slate-200 group ${isRecoveryMode ? 'bg-emerald-50 border-emerald-100' : ''}`}
          >
            <div className="flex flex-col items-start">
              <span className="text-xs font-bold text-slate-700">Mini</span>
              <span className="text-[10px] text-slate-500">{mini || 'Lakukan sedikit saja'}</span>
            </div>
            {isRecoveryMode && <span className="text-[9px] font-bold text-emerald-600">RECOMMENDED</span>}
          </button>
          <button 
            onClick={(e) => handleLevelClick(e, 'Plus')}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-white transition-colors border border-transparent hover:border-slate-200"
          >
            <div className="flex flex-col items-start">
              <span className="text-xs font-bold text-slate-700">Plus</span>
              <span className="text-[10px] text-slate-500">{plus || 'Target standar'}</span>
            </div>
          </button>
          <button 
            onClick={(e) => handleLevelClick(e, 'Elite')}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-white transition-colors border border-transparent hover:border-slate-200"
          >
            <div className="flex flex-col items-start">
              <span className="text-xs font-bold text-slate-700">Elite</span>
              <span className="text-[10px] text-slate-500">{elite || 'Lakukan maksimal'}</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default HabitItem;

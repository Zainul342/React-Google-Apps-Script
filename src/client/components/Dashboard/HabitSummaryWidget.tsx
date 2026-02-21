import React, { useEffect, useState } from 'react';
import { serverFunctions } from '../../utils/serverFunctions';

const HabitSummaryWidget: React.FC = () => {
  const [summary, setSummary] = useState<{ totalHabits: number, completedToday: number, percent: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    serverFunctions.getDailySummary().then(res => {
      if (res && res.data) {
        setSummary(res.data);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="h-24 animate-pulse bg-slate-50 rounded-2xl"></div>;
  if (!summary) return null;

  return (
    <div className="p-5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl text-white shadow-lg shadow-emerald-100 mb-4">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-xs font-bold uppercase tracking-widest opacity-80">Daily Harmony</h4>
        <span className="text-2xl font-black">{summary.percent}%</span>
      </div>
      <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden mb-3">
        <div 
          className="bg-white h-full transition-all duration-1000 ease-out" 
          style={{ width: `${summary.percent}%` }}
        ></div>
      </div>
      <p className="text-[10px] font-medium opacity-90">
        {summary.completedToday} dari {summary.totalHabits} habit selesai hari ini. 
        {summary.percent === 100 ? ' Luar biasa!' : summary.percent > 50 ? ' Hampir sana!' : ' Ayo mulai!'}
      </p>
    </div>
  );
};

export default HabitSummaryWidget;

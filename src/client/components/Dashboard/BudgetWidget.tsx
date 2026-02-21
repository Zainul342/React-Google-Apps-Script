import React, { useEffect, useState } from 'react';
import { serverFunctions } from '../../utils/serverFunctions';

const BudgetWidget: React.FC = () => {
  const [summary, setSummary] = useState<{ monthlyBudget: number, totalExpense: number, remaining: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    serverFunctions.getBudgetSummary().then(res => {
      if (res && res.data) {
        setSummary(res.data);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="h-24 animate-pulse bg-slate-50 rounded-2xl"></div>;
  if (!summary) return null;

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
  };

  const usagePercent = summary.monthlyBudget > 0 ? (summary.totalExpense / summary.monthlyBudget) * 100 : 0;
  const isOverBudget = summary.remaining < 0;

  return (
    <div className="p-5 bg-white border border-slate-100 rounded-3xl shadow-sm mb-4">
      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Budget Bulanan</h4>
      
      <div className="flex justify-between items-end mb-4">
        <div>
          <span className="text-[10px] text-slate-500 block mb-1">Sisa Saldo</span>
          <span className={`text-xl font-bold ${isOverBudget ? 'text-red-500' : 'text-slate-800'}`}>
            {formatIDR(summary.remaining)}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-500 block mb-1">Terpakai</span>
          <span className="text-xs font-semibold text-slate-600">{Math.round(usagePercent)}%</span>
        </div>
      </div>

      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-700 ${isOverBudget ? 'bg-red-400' : 'bg-slate-400'}`} 
          style={{ width: `${Math.min(100, usagePercent)}%` }}
        ></div>
      </div>
    </div>
  );
};

export default BudgetWidget;

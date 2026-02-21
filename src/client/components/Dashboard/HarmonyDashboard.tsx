import React from 'react';
import HabitSummaryWidget from './HabitSummaryWidget';
import BudgetWidget from './BudgetWidget';
import QuickTransaction from './QuickTransaction';
import HabitList from './HabitList';

const HarmonyDashboard: React.FC = () => {
  return (
    <div className="flex flex-col space-y-4 pb-10 animate-in fade-in duration-700">
      {/* Visual Summary Section */}
      <div className="px-4 pt-4">
        <HabitSummaryWidget />
        <BudgetWidget />
      </div>

      {/* Action Section */}
      <QuickTransaction />

      {/* Detail Section */}
      <div className="py-2">
        <HabitList />
      </div>
    </div>
  );
};

export default HarmonyDashboard;

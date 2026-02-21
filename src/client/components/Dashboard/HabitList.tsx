import React, { useState, useEffect } from 'react';
import HabitItem from './HabitItem';
import { serverFunctions } from '../../utils/serverFunctions';
import { Habit } from '../../../shared/interfaces';

const HabitList: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completedToday, setCompletedToday] = useState<{name: string, level: string}[]>([]);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const todaysResponse = await serverFunctions.getTodaysHabits();
      if (todaysResponse && todaysResponse.data) {
        setCompletedToday(todaysResponse.data);
      }

      const configResponse = await serverFunctions.getUserConfig();
      if (configResponse && configResponse.habits) {
        setHabits(configResponse.habits);
      }

      const recoveryResponse = await serverFunctions.getRecoveryStatus();
      if (recoveryResponse && recoveryResponse.needsRecovery) {
        setIsRecoveryMode(true);
      }

      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch initial habit data:', err);
      setLoading(false);
    }
  };

  const handleLog = (name: string, level: string) => {
    // Optimistic update
    setCompletedToday(prev => [...prev, { name, level }]);
    
    serverFunctions.logHabit(name, level).then((res: any) => {
      if (res && res.error) {
        alert(res.error);
        fetchInitialData(); // Rollback on error
      }
    }).catch(err => {
      console.error('Failed to log habit:', err);
      fetchInitialData();
    });
  };

  if (loading) {
    return <div className="text-center py-10 text-slate-400 animate-pulse">Loading habits...</div>;
  }

  const getCompletedLevel = (name: string) => {
    return completedToday.find(c => c.name === name)?.level;
  };

  return (
    <div className="px-4 py-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Habit Hari Ini</h3>
        {isRecoveryMode && (
          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-200 animate-pulse">
            RECOVERY MODE
          </span>
        )}
      </div>
      {habits.length > 0 ? (
        habits.map((habit, idx) => {
          const completedLevel = getCompletedLevel(habit.name);
          return (
            <HabitItem 
              key={idx} 
              name={habit.name} 
              mini={habit.mini}
              plus={habit.plus}
              elite={habit.elite}
              isCompleted={!!completedLevel} 
              completedLevel={completedLevel}
              onLog={handleLog}
              isRecoveryMode={isRecoveryMode}
            />
          );
        })
      ) : (
        <div className="p-6 border-2 border-dashed border-slate-200 rounded-2xl text-center">
          <p className="text-sm text-slate-500 mb-2">Belum ada habit diatur.</p>
          <p className="text-xs text-slate-400 italic">Gunakan 'Setup Wizard' untuk memulai.</p>
        </div>
      )}
    </div>
  );
};

export default HabitList;

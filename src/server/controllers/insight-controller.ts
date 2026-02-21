import { getUserConfig } from './config-controller';

/**
 * Insight Controller
 * Analyzes patterns between habits and spending.
 */

const HABIT_DB_TAB = '_DB_HABITS';
const FINANCE_DB_TAB = '_DB_FINANCE';

interface DailyStats {
  date: string;
  habitScore: number;
  totalSpend: number;
}

export const getBehavioralInsights = () => {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const habitSheet = ss.getSheetByName(HABIT_DB_TAB);
  const financeSheet = ss.getSheetByName(FINANCE_DB_TAB);

  if (!habitSheet || !financeSheet) return { data: null, error: 'Database missing' };

  // 1. Aggregate Data
  const habitData = habitSheet.getDataRange().getValues().slice(1);
  const financeData = financeSheet.getDataRange().getValues().slice(1);
  const configResult = getUserConfig();
  const totalHabits = configResult.data?.habits?.length || 1;

  const statsByDate: Record<string, DailyStats> = {};

  // Process Habits
  habitData.forEach(row => {
    const date = row[0] instanceof Date ? row[0].toISOString().split('T')[0] : String(row[0]);
    if (!statsByDate[date]) statsByDate[date] = { date, habitScore: 0, totalSpend: 0 };
    if (row[3] === 'Completed') {
      statsByDate[date].habitScore += (1 / totalHabits);
    }
  });

  // Process Finance
  financeData.forEach(row => {
    const date = row[0] instanceof Date ? row[0].toISOString().split('T')[0] : String(row[0]);
    if (!statsByDate[date]) statsByDate[date] = { date, habitScore: 0, totalSpend: 0 };
    if (row[3] === 'Expense') {
      statsByDate[date].totalSpend += Number(row[2]) || 0;
    }
  });

  // 2. Analyze Correlations
  const days = Object.values(statsByDate);
  if (days.length < 3) return { data: "Not enough data yet.", error: null };

  const lowHabitDays = days.filter(d => d.habitScore < 0.4);
  const highHabitDays = days.filter(d => d.habitScore > 0.7);

  if (lowHabitDays.length === 0 || highHabitDays.length === 0) {
    return { data: "Keep tracking to see patterns.", error: null };
  }

  const avgSpendLow = lowHabitDays.reduce((sum, d) => sum + d.totalSpend, 0) / lowHabitDays.length;
  const avgSpendHigh = highHabitDays.reduce((sum, d) => sum + d.totalSpend, 0) / highHabitDays.length;

  // 3. Generate Insight
  if (avgSpendLow > avgSpendHigh * 1.15) {
    const diff = Math.round(((avgSpendLow - avgSpendHigh) / avgSpendHigh) * 100);
    return { 
      data: `💡 Insight: On days with low habit completion, you spend ${diff}% more than usual.`, 
      error: null 
    };
  }

  if (avgSpendHigh > avgSpendLow * 1.15) {
     return { 
      data: `💡 Insight: High productivity days correlate with higher spending (Self-reward?).`, 
      error: null 
    };
  }

  return { data: "Your spending is consistent regardless of habit performance.", error: null };
};

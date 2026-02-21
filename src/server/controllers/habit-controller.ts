import { logToSystem } from '../utils/logger';
import { getUserConfig } from './config-controller';
import { refreshSheetDashboard } from './dashboard-controller';

/**
 * Habit Controller
 * Manages logging and retrieval of habit tracking data.
 */

const HABIT_DB_TAB = '_DB_HABITS';

/**
 * Logs a habit completion for today.
 * Prevents duplicate entries for the same habit on the same day.
 */
export const logHabit = (habitName: string, level: string = 'Mini') => {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(HABIT_DB_TAB);
  
  if (!sheet) {
    throw new Error(`${HABIT_DB_TAB} not found. Ensure Epic 1 initialization is correct.`);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];

  const data = sheet.getDataRange().getValues();
  // Check for existing entry for today and same habit
  const alreadyLogged = data.some(row => {
    const rowDate = row[0] instanceof Date ? row[0].toISOString().split('T')[0] : String(row[0]);
    return rowDate === todayStr && row[1] === habitName;
  });

  if (alreadyLogged) {
    return { data: null, error: `Habit "${habitName}" sudah dicatat untuk hari ini.` };
  }

  sheet.appendRow([today, habitName, level, 'Completed']);
  
  logToSystem('INFO', `Habit logged: ${habitName} (Level: ${level})`, 'logHabit');
  refreshSheetDashboard();
  return { data: 'Berhasil mencatat habit!', error: null };
};

/**
 * Retrieves today's completed habits.
 */
export const getTodaysHabits = () => {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(HABIT_DB_TAB);
  if (!sheet) return { data: [], error: null };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];

  const data = sheet.getDataRange().getValues();
  const todaysList = data
    .filter(row => {
      const rowDate = row[0] instanceof Date ? row[0].toISOString().split('T')[0] : String(row[0]);
      return rowDate === todayStr;
    })
    .map(row => ({ name: row[1], level: row[2] }));

  return { data: todaysList, error: null };
};

/**
 * Finds the most recent date in _DB_HABITS.
 */
export const getLastActiveDate = (): Date | null => {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(HABIT_DB_TAB);
  if (!sheet) return null;

  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return null; // Only headers or empty

  // Performance optimization: Scan last 100 rows if sheet is large
  const startRow = Math.max(2, lastRow - 99);
  const numRows = lastRow - startRow + 1;
  const data = sheet.getRange(startRow, 1, numRows, 1).getValues();

  let latestDate: Date | null = null;
  for (let i = data.length - 1; i >= 0; i--) {
    const val = data[i][0];
    if (val instanceof Date) {
      if (!latestDate || val > latestDate) {
        latestDate = val;
      }
    } else if (typeof val === 'string' && val.trim() !== '') {
      const parsed = new Date(val);
      if (!isNaN(parsed.getTime())) {
        if (!latestDate || parsed > latestDate) {
          latestDate = parsed;
        }
      }
    }
  }

  return latestDate;
};

/**
 * Calculates the difference in days between Today and the Last Active Date.
 * Uses the spreadsheet's timezone for consistency.
 */
export const calculateAbsenceDays = (lastActive: Date, today: Date = new Date()): number => {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const tz = ss.getSpreadsheetTimeZone();

  // Reset hours to midnight in the specific timezone to compare full days
  const formatDate = (d: Date) => Utilities.formatDate(d, tz, 'yyyy-MM-dd');
  
  const d1 = new Date(formatDate(lastActive));
  const d2 = new Date(formatDate(today));

  const diffTime = d2.getTime() - d1.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays);
};

/**
 * Checks for absence and flags the user properties if recovery is needed.
 */
export const checkAndFlagAbsence = (today: Date = new Date()) => {
  const lastActive = getLastActiveDate();
  if (!lastActive) {
    // New user or no data, no absence
    PropertiesService.getUserProperties().setProperty('NEEDS_RECOVERY', 'false');
    return;
  }

  const absenceDays = calculateAbsenceDays(lastActive, today);
  const needsRecovery = absenceDays > 1;

  PropertiesService.getUserProperties().setProperty('NEEDS_RECOVERY', needsRecovery.toString());

  if (needsRecovery) {
    logToSystem('WARN', `Absence detected: ${absenceDays} days missed since ${lastActive.toISOString().split('T')[0]}. Recovery Mode flagged.`, 'checkAndFlagAbsence');
  }
  refreshSheetDashboard();
};

/**
 * Returns the current recovery status for the client.
 */
export const getRecoveryStatus = () => {
  const needsRecovery = PropertiesService.getUserProperties().getProperty('NEEDS_RECOVERY') === 'true';
  return { needsRecovery };
};

/**
 * Updates the recovery status and logs the user's choice.
 */
export const setRecoveryMode = (active: boolean) => {
  PropertiesService.getUserProperties().setProperty('NEEDS_RECOVERY', active.toString());
  logToSystem('INFO', `User ${active ? 'activated' : 'declined'} Recovery Mode.`, 'setRecoveryMode');
  refreshSheetDashboard();
  return { data: 'Success', error: null };
};

/**
 * Returns a summary of daily habit performance.
 */
export const getDailySummary = () => {
  try {
    const configResult = getUserConfig();
    const config = configResult.data;
    const totalHabits = config?.habits?.length || 0;
    
    const todays = getTodaysHabits();
    const completedCount = todays.data ? todays.data.length : 0;
    
    const percent = totalHabits > 0 ? Math.round((completedCount / totalHabits) * 100) : 0;
    
    return {
      data: {
        totalHabits,
        completedToday: completedCount,
        percent,
      },
      error: null
    };
  } catch (e) {
    return { data: null, error: 'Failed to fetch daily summary' };
  }
};

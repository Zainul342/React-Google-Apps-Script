import { onOpen as originalOnOpen, openDialog, openAboutSidebar, openOnboarding as originalOpenOnboarding } from './ui';
import { getSheetsData, addSheet, deleteSheet, setActiveSheet } from './sheets';
import { initializeDatabase as originalInitializeDatabase } from './controllers/database-controller';
import { isFirstTimeUser as originalIsFirstTimeUser, saveUserConfig as originalSaveUserConfig, getUserConfig as originalGetUserConfig } from './controllers/config-controller';
import { logHabit as originalLogHabit, getTodaysHabits as originalGetTodaysHabits, checkAndFlagAbsence as originalCheckAndFlagAbsence, getRecoveryStatus as originalGetRecoveryStatus, setRecoveryMode as originalSetRecoveryMode, getDailySummary as originalGetDailySummary } from './controllers/habit-controller';
import { logTransaction as originalLogTransaction, undoLastTransaction as originalUndoLastTransaction, getBudgetSummary as originalGetBudgetSummary } from './controllers/finance-controller';
import { setupSheetDashboard as originalSetupSheetDashboard, refreshSheetDashboard as originalRefreshSheetDashboard } from './controllers/dashboard-controller';
import { generateSampleData as originalGenerateSampleData } from './controllers/seeder-controller';
import { submitTechnicalIssue as originalSubmitTechnicalIssue } from './controllers/support-controller';
import { checkAndRestoreIntegrity as originalCheckAndRestoreIntegrity, runRepair as originalRunRepair } from './core/integrity-checker';
import { logError, notifyUserOfError } from './utils/logger';

/**
 * Global Wrapper for Error Catching
 */
const wrap = (fn: Function, context: string, notify: boolean = false) => {
  return (...args: any[]) => {
    try {
      return fn(...args);
    } catch (e) {
      logError(e, context);
      if (notify) {
        notifyUserOfError();
      }
      throw e; // Re-throw for Apps Script exception logging if needed
    }
  };
};

// Wrapped Exports
export const onOpen = wrap(originalOnOpen, 'onOpen');
export const openOnboarding = wrap(originalOpenOnboarding, 'openOnboarding');
export const initializeDatabase = wrap(originalInitializeDatabase, 'initializeDatabase');
export const isFirstTimeUser = wrap(originalIsFirstTimeUser, 'isFirstTimeUser');
export const saveUserConfig = wrap(originalSaveUserConfig, 'saveUserConfig', true);
export const getUserConfig = wrap(originalGetUserConfig, 'getUserConfig');
export const logHabit = wrap(originalLogHabit, 'logHabit', true);
export const getTodaysHabits = wrap(originalGetTodaysHabits, 'getTodaysHabits');
export const getDailySummary = wrap(originalGetDailySummary, 'getDailySummary');
export const checkAndFlagAbsence = wrap(originalCheckAndFlagAbsence, 'checkAndFlagAbsence');
export const getRecoveryStatus = wrap(originalGetRecoveryStatus, 'getRecoveryStatus');
export const setRecoveryMode = wrap(originalSetRecoveryMode, 'setRecoveryMode', true);
export const logTransaction = wrap(originalLogTransaction, 'logTransaction', true);
export const undoLastTransaction = wrap(originalUndoLastTransaction, 'undoLastTransaction', true);
export const getBudgetSummary = wrap(originalGetBudgetSummary, 'getBudgetSummary');
export const setupSheetDashboard = wrap(originalSetupSheetDashboard, 'setupSheetDashboard', true);
export const refreshSheetDashboard = wrap(originalRefreshSheetDashboard, 'refreshSheetDashboard');
export const generateSampleData = wrap(originalGenerateSampleData, 'generateSampleData', true);
export const submitTechnicalIssue = wrap(originalSubmitTechnicalIssue, 'submitTechnicalIssue', true);
export const checkAndRestoreIntegrity = wrap(originalCheckAndRestoreIntegrity, 'checkAndRestoreIntegrity');
export const runRepair = wrap(originalRunRepair, 'runRepair', true);

// Other exports (keeping UI simple for now)
export {
  openDialog,
  openAboutSidebar,
  getSheetsData,
  addSheet,
  deleteSheet,
  setActiveSheet,
};

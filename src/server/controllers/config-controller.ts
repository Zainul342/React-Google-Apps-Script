import { UserConfig } from '../../shared/interfaces';
import { logToSystem } from '../utils/logger';

/**
 * Config Controller
 * Manages user personalization and habit configurations.
 */

const CONFIG_TAB = '_CONFIG_HABITS';
const CONFIG_KEY = 'MAIN_USER_CONFIG';

/**
 * Checks if the user has completed the setup wizard.
 */
export const isFirstTimeUser = (): boolean => {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG_TAB);
  
  if (!sheet) return true;
  
  const data = sheet.getDataRange().getValues();
  // Skip header, look for CONFIG_KEY
  const configRow = data.find(row => row[0] === CONFIG_KEY);
  
  if (!configRow) return true;
  
  try {
    const config: UserConfig = JSON.parse(configRow[1]);
    return !config.setupComplete;
  } catch (e) {
    return true;
  }
};

/**
 * Saves or updates the user configuration JSON.
 */
export const saveUserConfig = (config: UserConfig) => {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG_TAB);
  
  if (!sheet) {
    throw new Error(`${CONFIG_TAB} not found. Ensure Epic 1 is complete.`);
  }
  
  const data = sheet.getDataRange().getValues();
  const configIndex = data.findIndex(row => row[0] === CONFIG_KEY);
  
  const jsonValue = JSON.stringify({
    ...config,
    setupComplete: true,
    setupDate: new Date().toISOString()
  });

  if (configIndex === -1) {
    sheet.appendRow([CONFIG_KEY, jsonValue]);
  } else {
    sheet.getRange(configIndex + 1, 2).setValue(jsonValue);
  }
  
  logToSystem('INFO', 'User configuration saved successfully.', 'saveUserConfig');
  return { data: 'Setup success!', error: null };
};

/**
 * Retrieves the user configuration.
 */
export const getUserConfig = () => {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG_TAB);
  if (!sheet) return { data: null, error: null };

  const data = sheet.getDataRange().getValues();
  const configRow = data.find(row => row[0] === CONFIG_KEY);
  if (!configRow) return { data: null, error: null };

  try {
    return { data: JSON.parse(configRow[1]), error: null };
  } catch (e) {
    return { data: null, error: 'Failed to parse config' };
  }
};

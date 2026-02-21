import { CRITICAL_FORMULAS } from '../models/integrity-model';
import { logToSystem } from '../utils/logger';

/**
 * Integrity Checker Core
 * Verifies and restores critical spreadsheet formulas.
 */

/**
 * Checks all critical ranges defined in the model.
 * Restores any formula that doesn't match the expected value.
 */
export const checkAndRestoreIntegrity = () => {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let restorationCount = 0;

  CRITICAL_FORMULAS.forEach((mapping) => {
    const sheet = ss.getSheetByName(mapping.sheetName);
    if (!sheet) {
      logToSystem('WARN', `Sheet not found: ${mapping.sheetName}`, 'checkAndRestoreIntegrity');
      return;
    }

    const range = sheet.getRange(mapping.range);
    const currentFormula = range.getFormula();

    if (currentFormula !== mapping.expectedFormula) {
      range.setFormula(mapping.expectedFormula);
      restorationCount++;
      
      logToSystem(
        'INFO', 
        `Restored formula in ${mapping.sheetName}!${mapping.range}: ${mapping.description}`,
        `Expected: ${mapping.expectedFormula} | Found: ${currentFormula}`
      );
    }
  });

  if (restorationCount > 0) {
    logToSystem('INFO', `Integrity check complete. Restored ${restorationCount} formulas.`, 'checkAndRestoreIntegrity');
  }
};

/**
 * Wrapper for manual repair trigger from UI.
 */
export const runRepair = () => {
  try {
    checkAndRestoreIntegrity();
    return { data: 'Repair process completed successfully.', error: null };
  } catch (e) {
    const error = e as Error;
    logToSystem('ERROR', `Repair failed: ${error.message}`, 'runRepair');
    return { data: null, error: error.message };
  }
};

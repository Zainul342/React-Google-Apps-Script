/**
 * Logger Utility
 * Logs events and errors to the _SYSTEM_LOG tab.
 */

/**
 * Core logging function with internal safety checks.
 */
export const logToSystem = (level: 'INFO' | 'WARN' | 'ERROR', message: string, context: string = '') => {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const logSheet = ss.getSheetByName('_SYSTEM_LOG');
    
    if (logSheet) {
      logSheet.appendRow([
        new Date(),
        level,
        message,
        context,
      ]);
    } else {
      // Fallback to console if sheet is missing
      console.warn(`Log sheet _SYSTEM_LOG not found. [${level}] ${message}`);
    }
  } catch (e) {
    // Ensure logging never crashes the main process
    console.error('CRITICAL: Failed to log to system:', e);
  }
};

/**
 * Specialized helper for logging errors.
 */
export const logError = (error: Error | any, context: string) => {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : '';
  
  logToSystem('ERROR', message, `${context}${stack ? ' | ' + stack : ''}`);
};

/**
 * Utility to notify user of issues in a serene way.
 */
export const notifyUserOfError = (userMessage: string = 'Harmony Tracker encountered a small hiccup. We have logged it for review.') => {
  try {
    SpreadsheetApp.getUi().alert('Mindful Notification', userMessage, SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (e) {
    console.warn('UI Alert failed (likely running in background):', e);
  }
};

/**
 * Database Controller
 * Handles initialization and management of hidden database tabs.
 */

const DB_TABS = {
  FINANCE: {
    name: '_DB_FINANCE',
    headers: ['Date', 'Description', 'Amount', 'Type', 'Category', 'Month'],
  },
  HABITS: {
    name: '_CONFIG_HABITS',
    headers: ['ConfigKey', 'JSONValue'],
  },
  HABIT_LOGS: {
    name: '_DB_HABITS',
    headers: ['Date', 'HabitName', 'Level', 'Status'],
  },
  MAPPING: {
    name: '_CONFIG_MAPPING',
    headers: ['Keyword', 'Category'],
    sampleData: [
      ['Kopi', 'Food & Drink'],
      ['Bakso', 'Food & Drink'],
      ['Gojek', 'Transport'],
      ['Grab', 'Transport'],
      ['Listrik', 'Bills'],
      ['Gaji', 'Income'],
    ]
  },
  LOG: {
    name: '_SYSTEM_LOG',
    headers: ['Timestamp', 'Level', 'Message', 'Context'],
  },
};

/**
 * Initializes the database tabs if they don't exist.
 * Sets headers and hides the tabs from the user.
 */
export const initializeDatabase = () => {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  Object.values(DB_TABS).forEach((tab) => {
    let sheet = ss.getSheetByName(tab.name);
    const isNew = !sheet;
    
    if (isNew) {
      sheet = ss.insertSheet(tab.name);
      sheet.appendRow(tab.headers);
      
      // Add sample data if available
      if ('sampleData' in tab && tab.sampleData) {
        tab.sampleData.forEach(row => sheet?.appendRow(row));
      }

      // Format header row
      const headerRange = sheet.getRange(1, 1, 1, tab.headers.length);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#f3f3f3');
      
      // Freeze header row
      sheet.setFrozenRows(1);
    }
    
    // Ensure sheet is hidden
    sheet.hideSheet();
  });
};

import { logToSystem } from '../utils/logger';
import { getUserConfig } from './config-controller';
import { refreshSheetDashboard } from './dashboard-controller';

/**
 * Finance Controller
 * Handles logging of financial transactions.
 */

const FINANCE_DB_TAB = '_DB_FINANCE';
const MAPPING_TAB = '_CONFIG_MAPPING';

/**
 * Validates the transaction amount.
 * Returns a warning message if anomalous, null otherwise.
 */
export const validateTransactionAmount = (amount: number, type: string): string | null => {
  if (amount <= 0 && type === 'Expense') return 'Jumlah harus lebih dari 0.';
  
  const HARD_LIMIT = 10000000; // 10 Million
  if (amount > HARD_LIMIT) return `Jumlah (${amount}) sangat besar. Yakin ingin mencatat?`;

  try {
    const configResult = getUserConfig();
    const config = configResult.data;
    if (config && config.monthlyBudgetTarget) {
      const threshold = config.monthlyBudgetTarget * 0.5; // 50% of budget
      if (amount > threshold && amount > 1000000) { // Only warn if > 1jt AND > 50% budget
        return `Jumlah ini melebihi 50% dari target budget bulanan Anda. Yakin?`;
      }
    }
  } catch (e) {
    // Ignore config errors for validation
  }

  return null;
};

/**
 * Automatically determines category based on description keywords.
 */
export const getCategoryForDescription = (desc: string): string => {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(MAPPING_TAB);
  if (!sheet) return 'Uncategorized';

  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return 'Uncategorized';

  const normalizedDesc = desc.toLowerCase();
  
  // Find match (prioritize longer keywords for accuracy)
  const mappings = data.slice(1)
    .filter(row => row[0] && row[1])
    .sort((a, b) => String(b[0]).length - String(a[0]).length);

  for (const row of mappings) {
    const keyword = String(row[0]).toLowerCase();
    if (normalizedDesc.includes(keyword)) {
      return String(row[1]);
    }
  }

  return 'Uncategorized';
};

/**
 * Logs a transaction to the database.
 * Schema: [Date, Description, Amount, Type, Category, Month]
 */
export const logTransaction = (desc: string, amount: number, type: 'Expense' | 'Income' = 'Expense', force: boolean = false) => {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(FINANCE_DB_TAB);

  if (!sheet) {
    throw new Error(`${FINANCE_DB_TAB} not found. Ensure Epic 1 initialization is correct.`);
  }

  // Validate amount unless forced
  if (!force) {
    const warning = validateTransactionAmount(amount, type);
    if (warning) {
      return { data: null, warning, error: null };
    }
  }

  const today = new Date();
  const monthStr = Utilities.formatDate(today, ss.getSpreadsheetTimeZone(), 'yyyy-MM');
  const category = getCategoryForDescription(desc);

  // New transaction row
  sheet.appendRow([
    today,
    desc,
    amount,
    type,
    category,
    monthStr
  ]);

  logToSystem('INFO', `${type} logged: ${desc} (${amount}) -> Category: ${category}`, 'logTransaction');
  refreshSheetDashboard();

  return { data: 'Transaksi berhasil dicatat!', error: null };
};

/**
 * Removes the last transaction row from the database.
 */
export const undoLastTransaction = () => {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(FINANCE_DB_TAB);

  if (!sheet) {
    throw new Error(`${FINANCE_DB_TAB} not found.`);
  }

  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    return { data: null, error: 'Tidak ada transaksi untuk dibatalkan.' };
  }

  sheet.deleteRow(lastRow);
  logToSystem('INFO', `Last transaction undone (row ${lastRow})`, 'undoLastTransaction');
  refreshSheetDashboard();

  return { data: 'Berhasil membatalkan transaksi terakhir.', error: null };
};

/**
 * Returns a summary of budget performance for the current month.
 */
export const getBudgetSummary = () => {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(FINANCE_DB_TAB);
    if (!sheet) return { data: null, error: 'Database tab missing' };

    const configResult = getUserConfig();
    const config = configResult.data;
    const monthlyBudget = config?.monthlyBudgetTarget || 0;

    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return { data: { monthlyBudget, totalExpense: 0, remaining: monthlyBudget }, error: null };
    }

    const today = new Date();
    const currentMonth = Utilities.formatDate(today, ss.getSpreadsheetTimeZone(), 'yyyy-MM');

    let totalExpense = 0;
    // Data schema: [Date, Description, Amount, Type, Category, Month]
    data.slice(1).forEach(row => {
      const amount = Number(row[2]) || 0;
      const type = String(row[3]);
      const month = String(row[5]);

      if (month === currentMonth && type === 'Expense') {
        totalExpense += amount;
      }
    });

    const remaining = monthlyBudget - totalExpense;

    return {
      data: {
        monthlyBudget,
        totalExpense,
        remaining,
      },
      error: null
    };
  } catch (e) {
    console.error('getBudgetSummary error:', e);
    return { data: null, error: 'Failed to calculate budget summary' };
  }
};

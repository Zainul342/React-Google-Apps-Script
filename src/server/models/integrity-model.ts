/**
 * Integrity Model
 * Defines the critical formulas that must be protected and restored.
 */

export interface IntegrityMapping {
  sheetName: string;
  range: string;
  expectedFormula: string;
  description: string;
}

/**
 * List of critical cell ranges and their expected formulas.
 * Note: These will be expanded as the Dashboard is implemented.
 */
export const CRITICAL_FORMULAS: IntegrityMapping[] = [
  {
    sheetName: 'Dashboard', // Assumes a sheet named 'Dashboard' exists or will be created
    range: 'B2',
    expectedFormula: '=SUM(_DB_FINANCE!C2:C)',
    description: 'Total Expenses Calculation',
  },
  {
    sheetName: 'Dashboard',
    range: 'B3',
    expectedFormula: '=COUNTIF(_DB_HABITS!B2:B, TRUE)',
    description: 'Total Habits Completed',
  },
];

import { logToSystem } from '../utils/logger';

/**
 * Seeder Controller
 * Populates the database with realistic dummy data for demo purposes.
 */

export const generateSampleData = () => {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Setup Habits Data
  const habitSheet = ss.getSheetByName('_DB_HABITS');
  if (habitSheet) {
    // Clear content but keep header if exists, actually easier to just clear all and rewrite header
    habitSheet.clear();
    habitSheet.appendRow(['Date', 'HabitName', 'Level', 'Status']); // Header
    
    const habits = ['Morning Run', 'Read 10 Pages', 'Drink Water', 'Meditation'];
    const levels = ['Mini', 'Plus', 'Elite'];
    const today = new Date();
    
    // Generate 35 days of history
    for (let i = 35; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      // Randomly complete habits (80% success rate for realistic heatmap)
      habits.forEach(habit => {
        if (Math.random() > 0.2) { 
          const level = levels[Math.floor(Math.random() * levels.length)];
          habitSheet.appendRow([date, habit, level, 'Completed']);
        }
      });
    }
  }

  // 2. Setup Finance Data
  const financeSheet = ss.getSheetByName('_DB_FINANCE');
  if (financeSheet) {
    financeSheet.clear();
    financeSheet.appendRow(['Date', 'Description', 'Amount', 'Type', 'Category', 'Month']);
    
    const categories = ['Food & Drink', 'Transport', 'Bills', 'Shopping', 'Health'];
    const descriptions = ['Kopi Kenangan', 'Gojek ke Kantor', 'Token Listrik', 'Tokopedia', 'Vitamin'];
    
    // Generate 15 transactions
    for (let i = 0; i < 15; i++) {
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 10));
      const desc = descriptions[Math.floor(Math.random() * descriptions.length)];
      const amount = (Math.floor(Math.random() * 50) + 10) * 1000;
      const category = categories[Math.floor(Math.random() * categories.length)];
      const month = Utilities.formatDate(date, ss.getSpreadsheetTimeZone(), 'yyyy-MM');
      
      financeSheet.appendRow([date, desc, amount, 'Expense', category, month]);
    }
  }

  logToSystem('INFO', 'Sample data generated successfully.', 'Seeder');
  return 'Data Generated!';
};

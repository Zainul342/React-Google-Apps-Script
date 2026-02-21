import { getDailySummary } from './habit-controller';
import { getBudgetSummary } from './finance-controller';
import { getUserConfig } from './config-controller';
import { getBehavioralInsights } from './insight-controller';

/**
 * Dashboard Controller - V5.2 (Adaptive Atmospheric UI)
 */

const DASHBOARD_TAB = 'Harmony Dashboard';

// Theme Palettes
const THEMES = {
  FORGIVE: { // 0-30% - Soft, Neutral, Calming
    PRIMARY: '#64748b',    // Slate 500
    ACCENT: '#94a3b8',     // Slate 400
    BG_LIGHT: '#f8fafc',   // Slate 50
    TEXT_MAIN: '#334155',  // Slate 700
    TEXT_MUTE: '#94a3b8',
    BORDER: '#e2e8f0',
    PROGRESS_BAR: '#cbd5e1'
  },
  FOCUS: { // 31-70% - Blue/Teal, Encouraging
    PRIMARY: '#0e7490',    // Sky 700
    ACCENT: '#0ea5e9',     // Sky 500
    BG_LIGHT: '#f0f9ff',   // Sky 50
    TEXT_MAIN: '#0c4a6e',  // Sky 900
    TEXT_MUTE: '#64748b',
    BORDER: '#e0f2fe',
    PROGRESS_BAR: '#38bdf8'
  },
  HARMONY: { // 71-100% - Emerald/Gold, Celebrating
    PRIMARY: '#064e3b',    // Emerald 900
    ACCENT: '#10b981',     // Emerald 500
    BG_LIGHT: '#ecfdf5',   // Emerald 50
    TEXT_MAIN: '#064e3b',  // Emerald 900
    TEXT_MUTE: '#64748b',
    BORDER: '#d1fae5',
    PROGRESS_BAR: '#10b981'
  }
};

/**
 * Determines the theme based on daily progress.
 */
export const getTheme = (score: number) => {
  if (score >= 71) return THEMES.HARMONY;
  if (score >= 31) return THEMES.FOCUS;
  return THEMES.FORGIVE;
};

/**
 * Returns a mindful quote based on the current state, time, and streak.
 */
export const getMindfulQuote = (score: number) => {
  const hour = new Date().getHours();
  
  // High Score Celebration (Priority)
  if (score >= 100) return "Mastery unlocked. You are unstoppable today.";
  if (score >= 71) return "You are in flow. Keep this harmony alive.";
  
  // Time-based Prompts
  if (hour < 12) {
    return "Rise and shine. Small habits create big ripples.";
  }
  if (hour < 18) {
    if (score > 30) return "Momentum is building. Keep going.";
    return "It's never too late to start a good day.";
  }
  
  // Evening Reflection
  if (score > 50) return "A productive day. Rest well tonight.";
  return "Be kind to yourself. Tomorrow is a fresh start.";
};

/**
 * Creates and formats the main Harmony Dashboard tab.
 */
export const setupSheetDashboard = () => {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(DASHBOARD_TAB);

  if (!sheet) {
    sheet = ss.insertSheet(DASHBOARD_TAB, 0);
  }

  // Calculate initial state to set initial colors
  const habitSummary = getDailySummary();
  const score = habitSummary.data ? habitSummary.data.percent : 0;
  const theme = getTheme(score);

  // 1. Boundary Protection & Reset
  const requiredRows = 50;
  const requiredCols = 26;
  
  const currentRows = sheet.getMaxRows();
  const currentCols = sheet.getMaxColumns();
  
  if (currentRows < requiredRows) sheet.insertRowsAfter(currentRows, requiredRows - currentRows);
  if (currentCols < requiredCols) sheet.insertColumnsAfter(currentCols, requiredCols - currentCols);

  sheet.clear();
  sheet.clearFormats();
  sheet.setHiddenGridlines(true);
  
  // Micro-Grid
  for (let i = 1; i <= requiredCols; i++) {
    sheet.setColumnWidth(i, 35); 
  }
  sheet.setColumnWidth(1, 20); // Padding
  
  sheet.getRange(1, 1, requiredRows, requiredCols).setBackground(theme.BG_LIGHT);

  // 2. HERO HEADER
  const headerArea = sheet.getRange('B2:Z3');
  headerArea.setBackground('#ffffff').setBorder(true, true, true, true, false, false, theme.BORDER, SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  
  sheet.getRange('C2:H3').merge().setValue('✨ Harmony Tracker')
    .setFontSize(22).setFontWeight('bold').setFontColor(theme.TEXT_MAIN).setVerticalAlignment('middle');
  
  const todayStr = Utilities.formatDate(new Date(), ss.getSpreadsheetTimeZone(), 'EEE, dd MMM yyyy').toUpperCase();
  sheet.getRange('U2:Y3').merge().setValue(todayStr)
    .setFontSize(10).setFontWeight('bold').setFontColor(theme.TEXT_MUTE).setVerticalAlignment('middle').setHorizontalAlignment('right');

  // Quote
  const quote = getMindfulQuote(score);
  sheet.getRange('B4:Z4').merge().setValue(`“ ${quote} ”`)
    .setFontStyle('italic').setFontColor(theme.PRIMARY).setHorizontalAlignment('center').setFontSize(10);

  // 3. WIDGETS
  // Habit Card
  const habitCard = sheet.getRange('B5:I12');
  habitCard.setBackground('#ffffff').setBorder(true, true, true, true, false, false, theme.BORDER, SpreadsheetApp.BorderStyle.SOLID);
  sheet.getRange('C6:H6').merge().setValue('DAILY HABITS').setFontSize(9).setFontWeight('bold').setFontColor(theme.ACCENT).setHorizontalAlignment('center');
  sheet.getRange('B7:D8').merge().setValue(`${score}%`).setFontSize(32).setFontWeight('bold').setFontColor(theme.PRIMARY).setHorizontalAlignment('center').setVerticalAlignment('middle');
  sheet.getRange('F7:H8').merge().setFormula(`=IFERROR(SPARKLINE(B7, {"charttype", "bar"; "max", 100; "color1", "${theme.PROGRESS_BAR}"}), "")`);
  
  // Budget Card
  const budgetCard = sheet.getRange('K5:R12');
  budgetCard.setBackground('#ffffff').setBorder(true, true, true, true, false, false, theme.BORDER, SpreadsheetApp.BorderStyle.SOLID);
  sheet.getRange('L6:Q6').merge().setValue('BUDGET STATUS').setFontSize(9).setFontWeight('bold').setFontColor(theme.TEXT_MUTE).setHorizontalAlignment('center');
  sheet.getRange('L7:Q8').merge().setValue('Rp 0').setFontSize(20).setFontWeight('bold').setFontColor(theme.TEXT_MAIN).setHorizontalAlignment('center').setVerticalAlignment('middle');

  // Actions
  const actionCard = sheet.getRange('T5:Z12');
  actionCard.setBackground('#ffffff').setBorder(true, true, true, true, false, false, theme.BORDER, SpreadsheetApp.BorderStyle.SOLID);
  sheet.getRange('U6:Y6').merge().setValue('QUICK ACTIONS').setFontSize(9).setFontWeight('bold').setFontColor(theme.TEXT_MAIN).setHorizontalAlignment('center');
  
  const logBtn = sheet.getRange('U8:Y8');
  logBtn.merge().setValue('🚀 OPEN SIDEBAR').setBackground(theme.PRIMARY).setFontColor('#ffffff').setFontWeight('bold').setFontSize(9).setHorizontalAlignment('center').setVerticalAlignment('middle');
  
  const refreshBtn = sheet.getRange('U10:Y10');
  refreshBtn.merge().setValue('🔄 REFRESH DATA').setBackground(theme.BG_LIGHT).setFontColor(theme.TEXT_MAIN).setFontWeight('bold').setFontSize(9).setHorizontalAlignment('center').setVerticalAlignment('middle').setBorder(true, true, true, true, false, false, theme.BORDER, SpreadsheetApp.BorderStyle.SOLID);

  // Heatmap & Tables
  sheet.getRange('B14:Z14').merge().setValue('PRO-CONSISTENCY HEATMAP').setFontSize(10).setFontWeight('bold').setFontColor(theme.TEXT_MUTE);
  sheet.getRange('B15:Z20').setBackground('#ffffff').setBorder(true, true, true, true, false, false, theme.BORDER, SpreadsheetApp.BorderStyle.SOLID);
  
  sheet.getRange('B22:Z22').merge().setValue('RECENT TRANSACTIONS').setFontSize(10).setFontWeight('bold').setFontColor(theme.TEXT_MUTE);
  const tableRange = sheet.getRange('B23:Z35');
  tableRange.setBackground('#ffffff').setBorder(true, true, true, true, false, false, theme.BORDER, SpreadsheetApp.BorderStyle.SOLID);
  sheet.getRange('C24:Y24').setValues([['DATE', 'DESCRIPTION', ' ', ' ', ' ', ' ', 'AMOUNT', ' ', ' ', 'CATEGORY', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'STATUS']]).setFontWeight('bold').setFontSize(8).setFontColor(theme.TEXT_MUTE);

  // Cleanup
  const finalMaxRows = sheet.getMaxRows();
  const finalMaxCols = sheet.getMaxColumns();
  if (finalMaxRows > requiredRows) sheet.deleteRows(requiredRows + 1, finalMaxRows - requiredRows);
  if (finalMaxCols > requiredCols) sheet.deleteColumns(requiredCols + 1, finalMaxCols - requiredCols);

  refreshSheetDashboard();
};

/**
 * Updates the values and formulas on the Dashboard sheet based on real data.
 */
export const refreshSheetDashboard = () => {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(DASHBOARD_TAB);
  if (!sheet) return;

  const habitSummary = getDailySummary();
  const budgetSummary = getBudgetSummary();
  
  const score = habitSummary.data ? habitSummary.data.percent : 0;
  const theme = getTheme(score);

  // Update Background & Accents dynamically based on new score
  // We re-apply colors to critical areas to create the "Atmospheric" shift
  sheet.getRange(1, 1, 50, 26).setBackground(theme.BG_LIGHT);
  sheet.getRange('B2:Z3').setBorder(true, true, true, true, false, false, theme.BORDER, SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  
  // Update Header Text Color
  sheet.getRange('C2:H3').setFontColor(theme.TEXT_MAIN);
  
  // Update Quote
  const quote = getMindfulQuote(score);
  sheet.getRange('B4:Z4').setValue(`“ ${quote} ”`).setFontColor(theme.PRIMARY);

  // Update Widgets Colors
  sheet.getRange('B5:I12').setBorder(true, true, true, true, false, false, theme.BORDER, SpreadsheetApp.BorderStyle.SOLID);
  sheet.getRange('K5:R12').setBorder(true, true, true, true, false, false, theme.BORDER, SpreadsheetApp.BorderStyle.SOLID);
  sheet.getRange('T5:Z12').setBorder(true, true, true, true, false, false, theme.BORDER, SpreadsheetApp.BorderStyle.SOLID);
  
  // Update Button Colors
  sheet.getRange('U8:Y8').setBackground(theme.PRIMARY);
  sheet.getRange('U10:Y10').setBackground(theme.BG_LIGHT).setFontColor(theme.TEXT_MAIN).setBorder(true, true, true, true, false, false, theme.BORDER, SpreadsheetApp.BorderStyle.SOLID);

  // 1. Daily Habit Data
  if (habitSummary.data) {
    sheet.getRange('B7').setValue(`${score}%`).setFontColor(theme.PRIMARY);
    sheet.getRange('C6:H6').setFontColor(theme.ACCENT);
    sheet.getRange('C12:H12').setValue(`${habitSummary.data.completedToday} of ${habitSummary.data.totalHabits} done`).setFontColor(theme.TEXT_MUTE);
    sheet.getRange('F7:H8').setFormula(`=IFERROR(SPARKLINE(B7, {"charttype", "bar"; "max", 100; "color1", "${theme.PROGRESS_BAR}"}), "")`);
  }

  // 2. Monthly Budget Data
  if (budgetSummary.data) {
    const formatIDR = (num: number) => {
      return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
    };
    sheet.getRange('L7').setValue(formatIDR(budgetSummary.data.remaining)).setFontColor(theme.TEXT_MAIN);
    
    const usage = budgetSummary.data.monthlyBudget > 0 ? (budgetSummary.data.totalExpense / budgetSummary.data.monthlyBudget) * 100 : 0;
    // const barColor = usage > 90 ? '#ef4444' : theme.TEXT_MUTE;
    sheet.getRange('L12:Q12').setValue(usage > 100 ? '⚠️ OVER BUDGET' : '✅ Safe Balance').setFontColor(usage > 100 ? '#ef4444' : theme.TEXT_MUTE);
  }

  // 3. Heatmap
  const habitSheet = ss.getSheetByName('_DB_HABITS');
  const configResult = getUserConfig();
  const habitsInConfig = configResult.data?.habits || [];
  const totalHabitsInConfig = habitsInConfig.length || 1;

  if (habitSheet) {
    const habitData = habitSheet.getDataRange().getValues();
    const today = new Date();
    today.setHours(0,0,0,0);

    for (let i = 0; i < 35; i++) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() - (34 - i));
      const dateStr = targetDate.toISOString().split('T')[0];

      const completedCount = habitData.filter(row => {
        const rowDate = row[0] instanceof Date ? row[0].toISOString().split('T')[0] : '';
        return rowDate === dateStr && row[3] === 'Completed';
      }).length;

      const dailyPercent = (completedCount / totalHabitsInConfig) * 100;
      
      const col = (i % 7) + 3; // C to I
      const rowIdx = Math.floor(i / 7) + 16;
      
      let color = '#ffffff'; 
      // Use Theme colors for heatmap
      if (dailyPercent === 100) color = theme.PRIMARY;
      else if (dailyPercent >= 50) color = theme.ACCENT;
      else if (dailyPercent > 0) color = theme.PROGRESS_BAR; // Lighter shade usually needed here, using progress bar color as proxy
      
      // Override empty cells with white/border to keep grid look
      const cell = sheet.getRange(rowIdx, col);
      cell.setBackground(color === '#ffffff' ? theme.BG_LIGHT : color).setBorder(true, true, true, true, false, false, '#ffffff', SpreadsheetApp.BorderStyle.SOLID_THICK);
    }
  }

  // 4. INSIGHTS CARD
  const insights = getBehavioralInsights();
  const insightText = insights.data || "Keep tracking to see patterns.";
  
  sheet.getRange('S15:Z20').setBorder(true, true, true, true, false, false, theme.BORDER, SpreadsheetApp.BorderStyle.SOLID);
  sheet.getRange('T16:Y19').setValue(insightText).setFontColor(theme.TEXT_MAIN);

  // 5. Recent Activity
  const financeSheet = ss.getSheetByName('_DB_FINANCE');
  const categoryEmojis: Record<string, string> = {
    'Food & Drink': '🍔', 'Transport': '🚗', 'Bills': '⚡', 'Income': '💰',
    'Shopping': '🛍️', 'Health': '💊', 'Uncategorized': '📦'
  };

  if (financeSheet) {
    const lastRow = financeSheet.getLastRow();
    if (lastRow > 1) {
      const startRow = Math.max(2, lastRow - 9);
      const numRows = lastRow - startRow + 1;
      const data = financeSheet.getRange(startRow, 1, numRows, 6).getValues().reverse();
      
      sheet.getRange('C25:Y34').clearContent().clearFormat().setBackground('#ffffff');
      
      data.forEach((row, i) => {
        const date = row[0] instanceof Date ? Utilities.formatDate(row[0], ss.getSpreadsheetTimeZone(), 'dd MMM') : '';
        
        const targetRow = 25 + i;
        const emoji = categoryEmojis[String(row[4])] || '🔹';
        
        sheet.getRange(`C${targetRow}:D${targetRow}`).merge().setValue(date).setFontSize(8).setFontColor(theme.TEXT_MUTE);
        sheet.getRange(`E${targetRow}:L${targetRow}`).merge().setValue(row[1]).setFontWeight('medium').setFontColor(theme.TEXT_MAIN);
        sheet.getRange(`M${targetRow}:P${targetRow}`).merge().setValue(row[2]).setNumberFormat('#,##0').setFontWeight('bold').setFontColor(theme.TEXT_MAIN);
        sheet.getRange(`Q${targetRow}:V${targetRow}`).merge().setValue(`${emoji} ${row[4]}`).setFontSize(8).setFontColor(theme.TEXT_MUTE);
        sheet.getRange(`W${targetRow}:Y${targetRow}`).merge().setValue('✓').setFontColor(theme.ACCENT).setFontWeight('bold').setHorizontalAlignment('center');
      });
    }
  }
};

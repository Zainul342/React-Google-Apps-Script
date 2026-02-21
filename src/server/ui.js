export const onOpen = () => {
  // Initialize Database Tabs
  initializeDatabase();

  // Initialize/Refresh Sheet Dashboard
  setupSheetDashboard();
  
  // Set Dashboard as active
  const dashboard = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Harmony Dashboard');
  if (dashboard) dashboard.activate();

  // Verify and restore critical formulas
  checkAndRestoreIntegrity();

  // Detect and flag user absence
  checkAndFlagAbsence();

  const menu = SpreadsheetApp.getUi()
    .createMenu('Harmony Tracker')
    .addItem('Harmony Dashboard', 'openAboutSidebar')
    .addItem('Refresh Sheet View', 'refreshSheetDashboard')
    .addSeparator()
    .addItem('🛠️ Generate Demo Data', 'generateSampleData')
    .addSeparator()
    .addItem('Repair Formulas', 'runRepair')
    .addItem('Technical Settings', 'openDialog');

  menu.addToUi();

  // Auto-launch Onboarding for first-time users
  if (isFirstTimeUser()) {
    openOnboarding();
  }
};

export const openOnboarding = () => {
  const html = HtmlService.createHtmlOutputFromFile('onboarding')
    .setTitle('Harmony Onboarding')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  SpreadsheetApp.getUi().showSidebar(html);
};

export const openDialog = () => {
  const html = HtmlService.createHtmlOutputFromFile('dialog-demo')
    .setWidth(600)
    .setHeight(600);
  SpreadsheetApp.getUi().showModalDialog(html, 'Sheet Editor');
};

export const openDialogBootstrap = () => {
  const html = HtmlService.createHtmlOutputFromFile('dialog-demo-bootstrap')
    .setWidth(600)
    .setHeight(600);
  SpreadsheetApp.getUi().showModalDialog(html, 'Sheet Editor (Bootstrap)');
};

export const openDialogMUI = () => {
  const html = HtmlService.createHtmlOutputFromFile('dialog-demo-mui')
    .setWidth(600)
    .setHeight(600);
  SpreadsheetApp.getUi().showModalDialog(html, 'Sheet Editor (MUI)');
};

export const openDialogTailwindCSS = () => {
  const html = HtmlService.createHtmlOutputFromFile('dialog-demo-tailwindcss')
    .setWidth(600)
    .setHeight(600);
  SpreadsheetApp.getUi().showModalDialog(html, 'Sheet Editor (Tailwind CSS)');
};

export const openAboutSidebar = () => {
  const html = HtmlService.createHtmlOutputFromFile('sidebar-about-page');
  SpreadsheetApp.getUi().showSidebar(html);
};

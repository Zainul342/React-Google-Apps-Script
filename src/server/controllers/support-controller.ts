import { logToSystem } from '../utils/logger';

/**
 * Support Controller
 * Handles user-submitted technical issues and feedback.
 */

interface IssueData {
  subject: string;
  description: string;
  email?: string;
}

/**
 * Saves a user-reported issue to the system log.
 */
export const submitTechnicalIssue = (issueData: IssueData) => {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetId = ss.getId();
  
  const context = `User: ${issueData.email || 'Anonymous'} | SheetID: ${sheetId}`;
  const message = `[ISSUE REPORT] Sub: ${issueData.subject} | Desc: ${issueData.description}`;

  // Log as WARN so it stands out but doesn't signify a system crash
  logToSystem('WARN', message, context);

  return { 
    data: 'Terima kasih! Laporan Anda telah kami terima dan akan segera ditinjau.', 
    error: null 
  };
};

import { getBehavioralInsights } from './insight-controller';
import { getUserConfig } from './config-controller';

jest.mock('./config-controller', () => ({
  getUserConfig: jest.fn(),
}));

const mockSheet = {
  getDataRange: jest.fn(),
};

const mockSpreadsheet = {
  getSheetByName: jest.fn().mockReturnValue(mockSheet),
};

global.SpreadsheetApp = {
  getActiveSpreadsheet: () => mockSpreadsheet,
} as any;

describe('Insight Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getUserConfig as jest.Mock).mockReturnValue({
      data: { habits: [{ name: 'A' }, { name: 'B' }] },
      error: null
    });
  });

  it('should identify higher spending on low habit days', () => {
    mockSheet.getDataRange.mockReturnValueOnce({ // Habits
      getValues: jest.fn().mockReturnValue([
        ['Date', 'Habit', 'Level', 'Status'],
        ['2026-02-01', 'A', 'Mini', 'Completed'], // 50%
        ['2026-02-02', 'A', 'Mini', 'Missed'],    // 0%
        ['2026-02-02', 'B', 'Mini', 'Missed'],
        ['2026-02-03', 'A', 'Mini', 'Completed'], // 100%
        ['2026-02-03', 'B', 'Mini', 'Completed'],
      ])
    }).mockReturnValueOnce({ // Finance
      getValues: jest.fn().mockReturnValue([
        ['Date', 'Desc', 'Amount', 'Type'],
        ['2026-02-01', 'Food', 50000, 'Expense'],
        ['2026-02-02', 'Food', 100000, 'Expense'], // High spend on low habit day
        ['2026-02-03', 'Food', 50000, 'Expense'],
      ])
    });

    const result = getBehavioralInsights();
    expect(result.data).toContain('spend 100% more');
  });
});

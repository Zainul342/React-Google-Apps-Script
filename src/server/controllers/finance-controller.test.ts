import { logTransaction, getBudgetSummary } from './finance-controller';
import { getUserConfig } from './config-controller';

jest.mock('./config-controller', () => ({
  getUserConfig: jest.fn(),
}));

// Mock SpreadsheetApp
const mockSheet = {
  appendRow: jest.fn(),
  getDataRange: jest.fn().mockReturnValue({
    getValues: jest.fn().mockReturnValue([['Date', 'Desc', 'Amount', 'Type', 'Category', 'Month']])
  }),
  getLastRow: jest.fn(),
  deleteRow: jest.fn(),
};

const mockSpreadsheet = {
  getSheetByName: jest.fn().mockReturnValue(mockSheet),
  getSpreadsheetTimeZone: jest.fn().mockReturnValue('UTC'),
};

global.SpreadsheetApp = {
  getActiveSpreadsheet: () => mockSpreadsheet,
} as any;

global.Utilities = {
  formatDate: (date: Date, tz: string, format: string) => {
    const iso = date.toISOString().split('T')[0]; // yyyy-MM-dd
    if (format === 'yyyy-MM') return iso.substring(0, 7);
    return iso;
  }
} as any;

describe('Finance Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('logTransaction', () => {
    it('should append a formatted transaction row to _DB_FINANCE with auto-category', () => {
      // Mock mapping sheet
      const mockMappingSheet = {
        getDataRange: jest.fn().mockReturnValue({
          getValues: jest.fn().mockReturnValue([
            ['Keyword', 'Category'],
            ['Kopi', 'Food'],
            ['Gojek', 'Transport']
          ])
        })
      };
      
      mockSpreadsheet.getSheetByName.mockImplementation((name) => {
        if (name === '_DB_FINANCE') return mockSheet;
        if (name === '_CONFIG_MAPPING') return mockMappingSheet;
        return null;
      });

      const result = logTransaction('Kopi Kenangan', 25000, 'Expense');
      
      expect(mockSheet.appendRow).toHaveBeenCalledWith([
        expect.any(Date),
        'Kopi Kenangan',
        25000,
        'Expense',
        'Food', // Auto-detected from 'Kopi'
        expect.any(String)
      ]);
    });

    it('should default to Uncategorized if no mapping matches', () => {
      const mockMappingSheet = {
        getDataRange: jest.fn().mockReturnValue({
          getValues: jest.fn().mockReturnValue([['Keyword', 'Category']])
        })
      };
      mockSpreadsheet.getSheetByName.mockImplementation((name) => {
        if (name === '_DB_FINANCE') return mockSheet;
        if (name === '_CONFIG_MAPPING') return mockMappingSheet;
        return null;
      });

      logTransaction('Barang Random', 1000, 'Expense');
      expect(mockSheet.appendRow).toHaveBeenCalledWith(
        expect.arrayContaining(['Barang Random', 1000, 'Expense', 'Uncategorized'])
      );
    });

    it('should return a warning if the amount is anomalously high', () => {
      // Mock user config with 1,000,000 budget
      const mockConfigSheet = {
        getDataRange: jest.fn().mockReturnValue({
          getValues: jest.fn().mockReturnValue([
            ['ConfigKey', 'JSONValue'],
            ['USER_CONFIG', JSON.stringify({ monthlyBudgetTarget: 1000000 })]
          ])
        })
      };

      mockSpreadsheet.getSheetByName.mockImplementation((name) => {
        if (name === '_DB_FINANCE') return mockSheet;
        if (name === '_CONFIG_HABITS') return mockConfigSheet;
        return null;
      });

      // 11jt is > 10jt hard limit AND > 50% of budget
      const result = logTransaction('Beli Mobil', 11000000, 'Expense');
      expect(result.warning).toBeDefined();
      expect(mockSheet.appendRow).not.toHaveBeenCalled();
    });

    it('should allow high amount if force parameter is true', () => {
      const result = logTransaction('Beli Mobil', 11000000, 'Expense', true);
      expect(result.warning).toBeUndefined();
      expect(mockSheet.appendRow).toHaveBeenCalled();
    });
  });

  describe('getBudgetSummary', () => {
    it('should return budget stats for the current month', () => {
      const { getBudgetSummary } = require('./finance-controller');
      
      // Mock 1,000,000 budget
      (getUserConfig as jest.Mock).mockReturnValue({
        data: { monthlyBudgetTarget: 1000000 },
        error: null
      });

      // Mock transactions: 200k expense, 50k expense
      const today = new Date();
      const monthStr = today.toISOString().split('T')[0].substring(0, 7);
      
      mockSheet.getDataRange.mockReturnValue({
        getValues: jest.fn().mockReturnValue([
          ['Date', 'Desc', 'Amount', 'Type', 'Category', 'Month'],
          [today, 'Makan', 200000, 'Expense', 'Food', monthStr],
          [today, 'Kopi', 50000, 'Expense', 'Food', monthStr]
        ])
      });

      const result = getBudgetSummary();
      expect(result.data.monthlyBudget).toBe(1000000);
      expect(result.data.totalExpense).toBe(250000);
      expect(result.data.remaining).toBe(750000);
    });
  });

  describe('undoLastTransaction', () => {
    const { undoLastTransaction } = require('./finance-controller');

    it('should delete the last row if more than 1 row exists', () => {
      const mockSheetWithData = {
        getLastRow: jest.fn().mockReturnValue(5),
        deleteRow: jest.fn(),
      };
      mockSpreadsheet.getSheetByName.mockReturnValue(mockSheetWithData);

      const result = undoLastTransaction();
      expect(mockSheetWithData.deleteRow).toHaveBeenCalledWith(5);
      expect(result.error).toBeNull();
    });

    it('should not delete anything if only header exists', () => {
      const mockSheetHeaderOnly = {
        getLastRow: jest.fn().mockReturnValue(1),
        deleteRow: jest.fn(),
      };
      mockSpreadsheet.getSheetByName.mockReturnValue(mockSheetHeaderOnly);

      const result = undoLastTransaction();
      expect(mockSheetHeaderOnly.deleteRow).not.toHaveBeenCalled();
      expect(result.error).toBeDefined();
    });
  });
});

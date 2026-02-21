import { getLastActiveDate, calculateAbsenceDays, checkAndFlagAbsence, getRecoveryStatus, setRecoveryMode, getDailySummary } from './habit-controller';

(global as any).getUserConfig = jest.fn();

// Mock SpreadsheetApp
const mockSheet = {
  getDataRange: jest.fn().mockReturnValue({
    getValues: jest.fn().mockReturnValue([
      ['Date', 'Habit', 'Level', 'Status'],
      [new Date('2026-02-10T00:00:00Z'), 'Exercise', 'Elite', 'Completed'],
      [new Date('2026-02-15T00:00:00Z'), 'Exercise', 'Elite', 'Completed'],
    ]),
  }),
  getLastRow: jest.fn().mockReturnValue(3),
  getRange: jest.fn().mockReturnValue({
    getValues: jest.fn().mockReturnValue([
      [new Date('2026-02-10T00:00:00Z')],
      [new Date('2026-02-15T00:00:00Z')],
    ]),
  }),
  appendRow: jest.fn(),
};

const mockSpreadsheet = {
  getSheetByName: jest.fn().mockReturnValue(mockSheet),
  getSpreadsheetTimeZone: jest.fn().mockReturnValue('UTC'),
};

global.SpreadsheetApp = {
  getActiveSpreadsheet: () => mockSpreadsheet,
} as any;

const mockUserProperties = {
  setProperty: jest.fn(),
  getProperty: jest.fn(),
};

global.PropertiesService = {
  getUserProperties: () => mockUserProperties,
} as any;

global.Utilities = {
  formatDate: (date: Date, tz: string, format: string) => {
    // Simple mock implementation of formatDate
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, '0');
    const d = String(date.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
} as any;

describe('Habit Controller - Absence Detection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSheet.getLastRow.mockReturnValue(3);
    mockSheet.getRange().getValues.mockReturnValue([
      [new Date('2026-02-10T00:00:00Z')],
      [new Date('2026-02-15T00:00:00Z')],
    ]);
  });

  describe('getLastActiveDate', () => {
    it('should return the latest date from _DB_HABITS', () => {
      const result = getLastActiveDate();
      expect(result?.toISOString().split('T')[0]).toBe('2026-02-15');
    });

    it('should return null if sheet is empty (only headers)', () => {
      mockSheet.getLastRow.mockReturnValue(1);
      const result = getLastActiveDate();
      expect(result).toBeNull();
    });
  });

  describe('calculateAbsenceDays', () => {
    it('should return 0 if last active was today', () => {
      const today = new Date('2026-02-18T10:00:00Z');
      const lastActive = new Date('2026-02-18T00:00:00Z');
      expect(calculateAbsenceDays(lastActive, today)).toBe(0);
    });

    it('should return 1 if last active was yesterday', () => {
      const today = new Date('2026-02-18T10:00:00Z');
      const lastActive = new Date('2026-02-17T00:00:00Z');
      expect(calculateAbsenceDays(lastActive, today)).toBe(1);
    });

    it('should return 3 if last active was 3 days ago', () => {
      const today = new Date('2026-02-18T10:00:00Z');
      const lastActive = new Date('2026-02-15T00:00:00Z');
      expect(calculateAbsenceDays(lastActive, today)).toBe(3);
    });
  });

  describe('checkAndFlagAbsence', () => {
    it('should set NEEDS_RECOVERY to true if absence > 1 day', () => {
      // Last active 2026-02-15, Today 2026-02-18 -> 3 days absence
      checkAndFlagAbsence(new Date('2026-02-18T10:00:00Z'));
      expect(mockUserProperties.setProperty).toHaveBeenCalledWith('NEEDS_RECOVERY', 'true');
    });

    it('should set NEEDS_RECOVERY to false if absence <= 1 day', () => {
      // Last active 2026-02-17, Today 2026-02-18 -> 1 day absence
      mockSheet.getRange().getValues.mockReturnValue([
        [new Date('2026-02-17T00:00:00Z')],
      ]);
      checkAndFlagAbsence(new Date('2026-02-18T10:00:00Z'));
      expect(mockUserProperties.setProperty).toHaveBeenCalledWith('NEEDS_RECOVERY', 'false');
    });
  });

  describe('getRecoveryStatus', () => {
    it('should return true if NEEDS_RECOVERY property is "true"', () => {
      mockUserProperties.getProperty.mockReturnValue('true');
      expect(getRecoveryStatus()).toEqual({ needsRecovery: true });
    });

    it('should return false if NEEDS_RECOVERY property is "false"', () => {
      mockUserProperties.getProperty.mockReturnValue('false');
      expect(getRecoveryStatus()).toEqual({ needsRecovery: false });
    });

    it('should return false if property is missing', () => {
      mockUserProperties.getProperty.mockReturnValue(null);
      expect(getRecoveryStatus()).toEqual({ needsRecovery: false });
    });
  });

  describe('setRecoveryMode', () => {
    it('should set NEEDS_RECOVERY property and log result', () => {
      setRecoveryMode(true);
      expect(mockUserProperties.setProperty).toHaveBeenCalledWith('NEEDS_RECOVERY', 'true');
    });
  });

  describe('logHabit with levels', () => {
    it('should append the correct level to the sheet', () => {
      const { logHabit } = require('./habit-controller');
      logHabit('Exercise', 'Elite');
      expect(mockSheet.appendRow).toHaveBeenCalledWith(
        expect.arrayContaining(['Exercise', 'Elite', 'Completed'])
      );
    });
  });

  describe('getDailySummary', () => {
    it('should return habit completion stats for today', () => {
      (global as any).getUserConfig.mockReturnValue({
        data: {
          habits: [{ name: 'Habit 1' }, { name: 'Habit 2' }]
        },
        error: null
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Mock 1 habit completed today in sheet
      mockSheet.getDataRange.mockReturnValue({
        getValues: jest.fn().mockReturnValue([
          ['Date', 'HabitName', 'Level', 'Status'],
          [today, 'Habit 1', 'Mini', 'Completed']
        ])
      });

      const result = getDailySummary();
      expect(result.data.totalHabits).toBe(2);
      expect(result.data.completedToday).toBe(1);
      expect(result.data.percent).toBe(50);
    });
  });
});

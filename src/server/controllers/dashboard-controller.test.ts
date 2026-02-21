import { getTheme, getMindfulQuote } from './dashboard-controller';

describe('Dashboard Controller - Theme Logic', () => {
  describe('getTheme', () => {
    it('should return FORGIVE theme for low scores (0-30)', () => {
      const theme = getTheme(10);
      expect(theme.PRIMARY).toBe('#64748b'); // Slate 500
    });

    it('should return FOCUS theme for medium scores (31-70)', () => {
      const theme = getTheme(50);
      expect(theme.PRIMARY).toBe('#0e7490'); // Sky 700
    });

    it('should return HARMONY theme for high scores (71-100)', () => {
      const theme = getTheme(90);
      expect(theme.PRIMARY).toBe('#064e3b'); // Emerald 900
    });
  });

  describe('getMindfulQuote', () => {
    const mockDate = (hours: number) => {
      const date = new Date('2026-02-18T00:00:00');
      date.setHours(hours);
      jest.spyOn(global, 'Date').mockImplementation(() => date as any);
    };

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should celebrate high scores regardless of time', () => {
      mockDate(10);
      expect(getMindfulQuote(100)).toContain('Mastery unlocked');
      expect(getMindfulQuote(75)).toContain('in flow');
    });

    it('should return morning prompt before 12 PM', () => {
      mockDate(9);
      expect(getMindfulQuote(0)).toContain('Rise and shine');
    });

    it('should encourage momentum in afternoon with some progress', () => {
      mockDate(14);
      expect(getMindfulQuote(40)).toContain('Momentum is building');
    });

    it('should offer fresh start in afternoon with low progress', () => {
      mockDate(14);
      expect(getMindfulQuote(10)).toContain('never too late');
    });

    it('should suggest rest in evening', () => {
      mockDate(20);
      expect(getMindfulQuote(60)).toContain('Rest well');
      expect(getMindfulQuote(10)).toContain('Tomorrow is a fresh start');
    });
  });
});

import { format } from '../dateUtils';

describe('dateUtils', () => {
  describe('format', () => {
    it('formats hours correctly', () => {
      const date = new Date('2023-12-25T14:30:45');
      expect(format(date, 'HH')).toBe('14');
    });

    it('formats minutes correctly', () => {
      const date = new Date('2023-12-25T14:05:45');
      expect(format(date, 'mm')).toBe('05');
    });

    it('formats seconds correctly', () => {
      const date = new Date('2023-12-25T14:30:08');
      expect(format(date, 'ss')).toBe('08');
    });

    it('formats month correctly', () => {
      const date = new Date('2023-12-25T14:30:45');
      expect(format(date, 'MMM')).toBe('Dec');
    });

    it('formats day correctly', () => {
      const date = new Date('2023-12-05T14:30:45');
      expect(format(date, 'dd')).toBe('05');
    });

    it('formats year correctly', () => {
      const date = new Date('2023-12-25T14:30:45');
      expect(format(date, 'yyyy')).toBe('2023');
    });

    it('formats complete date string', () => {
      const date = new Date('2023-12-25T14:30:45');
      expect(format(date, 'MMM dd, yyyy HH:mm:ss')).toBe('Dec 25, 2023 14:30:45');
    });

    it('handles single digit values with padding', () => {
      const date = new Date('2023-01-05T08:05:05');
      expect(format(date, 'MMM dd, yyyy HH:mm:ss')).toBe('Jan 05, 2023 08:05:05');
    });
  });
});
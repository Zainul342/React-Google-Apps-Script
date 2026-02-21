/**
 * Shared Interfaces
 * Used across client and server.
 */

export interface Habit {
  name: string;
  mini: string;  // e.g. "Pushup 1x"
  plus: string;  // e.g. "Pushup 20x"
  elite: string; // e.g. "Gym 1hr"
}

export interface UserConfig {
  userName: string;
  monthlyBudgetTarget: number;
  habits: Habit[];
  setupComplete: boolean;
  setupDate: string; // ISO 8601
}

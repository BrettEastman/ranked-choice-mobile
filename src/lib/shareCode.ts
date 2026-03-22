import { limits } from './constants';

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I, O, 0, 1 to avoid confusion

/**
 * Generate a random share code (e.g., "K7X3MP").
 */
export function generateShareCode(): string {
  let code = '';
  for (let i = 0; i < limits.shareCodeLength; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return code;
}

/**
 * Normalize a share code for lookup (uppercase, trim).
 */
export function normalizeShareCode(code: string): string {
  return code.trim().toUpperCase();
}

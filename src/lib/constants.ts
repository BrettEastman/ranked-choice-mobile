// Color palette (carried over from the original Svelte app's Tailwind config)
export const colors = {
  primary: '#5C73C4',
  primaryDark: '#1D4ED8',
  secondary: '#A7393D',
  secondaryDark: '#7c2d32',
  secondaryLight: '#a10812',
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
} as const;

// Spacing scale
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// Typography
export const fonts = {
  body: 'Courier New',
  heading: 'System', // Will use system font; can swap for custom later
  mono: 'Courier New',
} as const;

export const fontSizes = {
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  title: 40,
} as const;

// App limits
export const limits = {
  minCandidates: 2,
  maxCandidates: 20,
  minVoters: 2,
  maxVoters: 50,
  defaultMaxRankChoices: 3,
  shareCodeLength: 6,
} as const;

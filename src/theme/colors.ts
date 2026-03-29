/**
 * Colors: Blue-purple (primary), Red (secondary), neutrals
 */

const palette = {
  // Blue-purple shades (primary brand color)
  indigo100: "#E0E4F2",
  indigo200: "#B3BBD9",
  indigo300: "#8692C0",
  indigo400: "#6F7DBB",
  indigo500: "#5C73C4",
  indigo600: "#4A5FA6",
  indigo700: "#3B4C88",
  indigo800: "#2C396A",
  indigo900: "#1D264C",

  // Red shades (secondary/accent color)
  red100: "#F5D5D6",
  red200: "#D99A9C",
  red300: "#C06266",
  red400: "#A7393D",
  red500: "#A10812",
  red600: "#8B2D31",
  red700: "#7C2D32",
  red800: "#5E1F24",
  red900: "#401517",

  // Gray shades (neutral colors)
  gray50: "#F9FAFB",
  gray100: "#F3F4F6",
  gray200: "#E5E7EB",
  gray300: "#D1D5DB",
  gray400: "#9CA3AF",
  gray500: "#6B7280",
  gray600: "#4B5563",
  gray700: "#374151",
  gray800: "#1F2937",
  gray900: "#111827",

  // Pure colors
  white: "#FFFFFF",
  black: "#000000",
  transparent: "transparent",
} as const;

// Semantic color definitions for light theme
const lightTheme = {
  // Primary brand colors (indigo-based)
  primary: palette.indigo500,
  primaryLight: palette.indigo400,
  primaryDark: palette.indigo700,
  primaryContainer: palette.indigo100,
  onPrimary: palette.white,
  onPrimaryContainer: palette.indigo800,

  // Secondary colors (red-based)
  secondary: palette.red400,
  secondaryLight: palette.red300,
  secondaryDark: palette.red700,
  secondaryContainer: palette.red100,
  onSecondary: palette.white,
  onSecondaryContainer: palette.red800,

  // Background colors
  background: palette.gray50,
  backgroundSecondary: palette.gray100,
  surface: palette.white,
  surfaceVariant: palette.gray50,
  surfaceContainer: palette.gray100,
  onBackground: palette.black,
  onSurface: palette.black,
  onSurfaceVariant: palette.gray600,

  // Text colors
  textPrimary: palette.gray900,
  textSecondary: palette.gray600,
  textTertiary: palette.gray500,
  textDisabled: palette.gray400,
  textOnPrimary: palette.white,
  textOnSecondary: palette.white,

  // Border and divider colors
  border: palette.gray200,
  borderLight: palette.gray100,
  divider: palette.gray200,
  outline: palette.gray300,
  outlineVariant: palette.gray200,

  // Status colors
  error: palette.red400,
  errorContainer: palette.red100,
  onError: palette.white,
  onErrorContainer: palette.red700,

  // Shadow colors
  shadow: `${palette.black}26`,
  elevation: `${palette.black}1F`,
} as const;

// Type definitions
export type ColorPalette = typeof palette;
export type ThemeColors = typeof lightTheme;

export const colors = {
  palette,
  light: lightTheme,
} as const;

export default colors;

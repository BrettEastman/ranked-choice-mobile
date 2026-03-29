import {
  colors as colorSystem,
  type ColorPalette,
  type ThemeColors,
} from "./colors";
import {
  fontFamily,
  fontSize,
  textStyles,
  type FontFamily,
  type FontSize,
} from "./fontStyles";

// Full color system (palette + semantic themes)
export { colorSystem };
export type { ColorPalette, ThemeColors };

// Flat colors API matching old constants shape for easy migration
// Usage: colors.primary, colors.gray[500], etc.
export const colors = {
  primary: colorSystem.light.primary,
  primaryDark: colorSystem.light.primaryDark,
  secondary: colorSystem.light.secondary,
  secondaryDark: colorSystem.light.secondaryDark,
  secondaryLight: colorSystem.light.secondaryLight,
  white: colorSystem.palette.white,
  black: colorSystem.palette.black,
  gray: {
    50: colorSystem.palette.gray50,
    100: colorSystem.palette.gray100,
    200: colorSystem.palette.gray200,
    300: colorSystem.palette.gray300,
    400: colorSystem.palette.gray400,
    500: colorSystem.palette.gray500,
    600: colorSystem.palette.gray600,
    700: colorSystem.palette.gray700,
    800: colorSystem.palette.gray800,
    900: colorSystem.palette.gray900,
  },
} as const;

export { fontFamily, fontSize, textStyles };
export type { FontFamily, FontSize };

// Convenience aliases matching the old constants API
export const fonts = fontFamily;
export const fontSizes = fontSize;

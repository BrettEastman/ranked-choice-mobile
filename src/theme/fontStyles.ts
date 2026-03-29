export const fontSize = {
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  title: 40,
} as const;

export type FontSize = keyof typeof fontSize;

// Font family tokens mapped to loaded font names
export const fontFamily = {
  cutiveMono: "CutiveMono_400Regular",
  body: "CutiveMono_400Regular",
  heading: "CutiveMono_400Regular",
  mono: "Courier New",
} as const;

export type FontFamily = keyof typeof fontFamily;

// Reusable text style presets combining font family and size
export const textStyles = {
  // Headings
  h1: {
    fontFamily: fontFamily.heading,
    fontSize: fontSize.title,
    fontWeight: "800" as const,
  },
  h2: {
    fontFamily: fontFamily.heading,
    fontSize: fontSize.xxl,
    fontWeight: "700" as const,
  },
  h3: {
    fontFamily: fontFamily.heading,
    fontSize: fontSize.xl,
    fontWeight: "700" as const,
  },
  h4: {
    fontFamily: fontFamily.heading,
    fontSize: fontSize.lg,
    fontWeight: "700" as const,
  },

  // Body text
  body: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.md,
  },
  bodySmall: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
  },
  bodyLarge: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.lg,
  },

  // Labels and captions
  label: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    fontWeight: "600" as const,
  },
  caption: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
  },

  // Mono (share codes, etc.)
  mono: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.lg,
    letterSpacing: 4,
  },
} as const;

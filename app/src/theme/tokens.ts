// Vasko design-tokens. Hold i synk med server/src/Vasko.Server/wwwroot/css/site.css (se .claude/skills/vasko-design).
export const colors = {
  navy: '#1F2E4A',
  cognac: '#8B5E3C',
  cream: '#F6F1E8',
  creamLight: '#FFFDF8',
  text: '#1F2E4A',
  textMuted: '#5C6577',
  border: '#E4DCCD',
  error: '#9B2C2C',
} as const;

export const fonts = {
  heading: 'CormorantGaramond_600SemiBold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 40,
  xxl: 64,
} as const;

export const radius = {
  md: 8,
} as const;

export const theme = { colors, fonts, spacing, radius } as const;

export type Theme = typeof theme;

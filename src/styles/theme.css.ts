import { createThemeContract, createTheme, globalStyle, keyframes } from "@vanilla-extract/css";

export const vars = createThemeContract({
  color: {
    background: null,
    foreground: null,
    textHighLight: null,
    card: null,
    cardForeground: null,
    primary: null,
    primaryForeground: null,
    secondary: null,
    secondaryForeground: null,
    muted: null,
    mutedForeground: null,
    badgeForeground: null,
    badgeBackground: null,
    accent: null,
    accentForeground: null,
    border: null,
    input: null,
    ring: null,
    spotlightForeground: null,
    spotlightBackground: null,
    rowBackground: null,
    listItemColor: null,
    listItemBulletColor: null,
    fieldValueColor: null,
    expRoleTitleColor: null,
  },
  space: {
    "0": null,
    "1": null,
    "2": null,
    "3": null,
    "4": null,
    "5": null,
    "6": null,
    "8": null,
    "10": null,
    "12": null,
    "16": null,
    "20": null,
  },
  radii: {
    sm: null,
    md: null,
    lg: null,
    full: null,
  },
  font: {
    sans: null,
    mono: null,
  },
  fontSize: {
    xs: null,
    sm: null,
    base: null,
    lg: null,
    xl: null,
    h3: null,
    h2: null,
    h1: null,
  },
  fontWeight: {
    normal: null,
    medium: null,
    semibold: null,
    bold: null,
  },
  lineHeight: {
    none: null,
    shorter: null,
    short: null,
    base: null,
    tall: null,
  },
});

// Common design tokens
const commonTokens = {
  space: {
    0: "0px",
    1: "0.25rem",
    2: "0.5rem",
    3: "0.75rem",
    4: "1rem",
    5: "1.25rem",
    6: "1.5rem",
    8: "2rem",
    10: "2.5rem",
    12: "3rem",
    16: "4rem",
    20: "5rem",
  },
  radii: {
    sm: "6px",
    md: "10px",
    lg: "16px",
    full: "9999px",
  },
  font: {
    sans: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    mono: "'Fira Code', 'JetBrains Mono', monospace",
  },
  fontSize: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    h3: "1.75rem",
    h2: "2.25rem",
    h1: "3.5rem",
  },
  fontWeight: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "800",
  },
  lineHeight: {
    none: "1",
    shorter: "1.15",
    short: "1.3",
    base: "1.6",
    tall: "1.75",
  },
};

// Dark theme definition
export const darkThemeClass = createTheme(vars, {
  ...commonTokens,
  color: {
    background: "#030303",
    foreground: "#f4f4f5",
    textHighLight: "rgba(224, 224, 224, 1)",
    card: "rgba(10, 10, 10, 0.7)",
    cardForeground: "#f4f4f5",
    primary: "#ffffff",
    primaryForeground: "#09090b",
    secondary: "#18181b",
    secondaryForeground: "#fafafa",
    muted: "#18181b",
    mutedForeground: "rgba(100, 116, 139, 1)",
    badgeForeground: "rgba(54, 220, 208, 1)",
    badgeBackground: "rgba(100, 255, 218, 0.05)",
    accent: "rgba(100, 255, 218, 0.05)", // teal micro tint
    accentForeground: "#ffffff",
    border: "rgba(255, 255, 255, 0.08)",
    input: "rgba(255, 255, 255, 0.03)",
    ring: "#64ffda", // teal
    spotlightForeground: "rgba(29, 78, 216, 0.15)",
    spotlightBackground: "transparent 80%",
    rowBackground: "rgba(30,41,59,.5)",
    listItemColor: "rgba(164, 168, 174, 1)",
    listItemBulletColor: "rgba(255, 255, 255, 0.9)",
    fieldValueColor: "rgb(135 147 164)",
    expRoleTitleColor: "rgba(227, 227, 227, 1)",
  },
});

// Light theme definition
export const lightThemeClass = createTheme(vars, {
  ...commonTokens,
  color: {
    background: "#f8fafc", // slate-50
    foreground: "#0f172a", // slate-900
    textHighLight: "rgba(46, 46, 46, 1)",
    card: "rgba(255, 255, 255, 0.8)",
    cardForeground: "#0f172a",
    primary: "#0f172a", // slate-900
    primaryForeground: "#ffffff",
    secondary: "#e2e8f0", // slate-200
    secondaryForeground: "#0f172a",
    muted: "#f1f5f9", // slate-100
    mutedForeground: "#475569", // slate-600
    badgeForeground: "rgb(125 115 115)",
    badgeBackground: "rgb(0 0 0 / 5%)",
    accent: "rgba(13, 148, 136, 0.06)", // teal-600 tint
    accentForeground: "#0f172a",
    border: "rgba(15, 23, 42, 0.08)",
    input: "rgba(15, 23, 42, 0.03)",
    ring: "#0d9488", // teal-600
    spotlightForeground: "rgba(224, 236, 247, 1)",
    spotlightBackground: "#ffffffeb 80%",
    rowBackground: "rgb(133 133 133 / 6%)",
    listItemColor: "rgba(93, 93, 93, 1)",
    listItemBulletColor: "rgb(150 151 151)",
    fieldValueColor: "rgb(135 147 164)",
    expRoleTitleColor: "rgb(68 68 68)",

  },
});

export const float = keyframes({
  "0%": { transform: "translateY(0px)" },
  "50%": { transform: "translateY(-10px)" },
  "100%": { transform: "translateY(0px)" },
});

export const pulseGlow = keyframes({
  "0%": { opacity: 0.4, transform: "scale(1)" },
  "50%": { opacity: 0.6, transform: "scale(1.05)" },
  "100%": { opacity: 0.4, transform: "scale(1)" },
});

export const fadeIn = keyframes({
  from: { opacity: 0, transform: "translateY(20px)" },
  to: { opacity: 1, transform: "translateY(0)" },
});

globalStyle("html, body", {
  margin: 0,
  padding: 0,
  backgroundColor: vars.color.background,
  color: vars.color.foreground,
  fontFamily: vars.font.sans,
  WebkitFontSmoothing: "antialiased",
  MozOsxFontSmoothing: "grayscale",
  scrollBehavior: "smooth",
  transition: "background-color 0.3s ease, color 0.3s ease",
});

globalStyle("body.lang-ko", {
  fontFamily: "'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
});

globalStyle("body.lang-en", {
  fontFamily: vars.font.sans,
});

globalStyle("body", {
  backgroundColor: "rgb(15, 23, 42)",
})

globalStyle("a", {
  color: "inherit",
  textDecoration: "none",
});

globalStyle("a:hover", {
  color: vars.color.ring,
  transition: "color 0.15s ease",
});

globalStyle("*", {
  boxSizing: "border-box",
});

globalStyle("::selection", {
  color: "#101e40",
  backgroundColor: "#4dc8fff5",
})

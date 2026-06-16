import { createTheme, globalStyle } from "@vanilla-extract/css";

export const [themeClass, vars] = createTheme({
  color: {
    background: "#09090b",
    foreground: "#fafafa",
    card: "#09090b",
    cardForeground: "#fafafa",
    primary: "#fafafa",
    primaryForeground: "#18181b",
    secondary: "#27272a",
    secondaryForeground: "#fafafa",
    muted: "#27272a",
    mutedForeground: "#a1a1aa",
    accent: "#27272a",
    accentForeground: "#fafafa",
    border: "#27272a",
    input: "#27272a",
    ring: "#d4d4d8",
  },
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
    sm: "4px",
    md: "6px",
    lg: "8px",
    full: "9999px",
  },
  font: {
    sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    mono: "'JetBrains Mono', Fira Code, Courier New, monospace",
  },
  fontSize: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    h3: "1.5rem",
    h2: "1.875rem",
    h1: "2.25rem",
  },
  fontWeight: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
  lineHeight: {
    none: "1",
    shorter: "1.25",
    short: "1.375",
    base: "1.5",
    tall: "1.625",
  },
});

globalStyle("html, body", {
  margin: 0,
  padding: 0,
  backgroundColor: vars.color.background,
  color: vars.color.foreground,
  fontFamily: vars.font.sans,
  WebkitFontSmoothing: "antialiased",
  MozOsxFontSmoothing: "grayscale",
});

globalStyle("*", {
  boxSizing: "border-box",
});

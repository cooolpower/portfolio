import { style } from "@vanilla-extract/css";
import { vars } from "@/styles/theme.css";

export const layout = style({
  maxWidth: "1100px",
  margin: "0 auto",
  padding: `0 ${vars.space[8]}`,
  minHeight: "100vh",
  display: "grid",
  gridTemplateColumns: "5fr 7fr",
  gap: "80px",
  alignItems: "start",
  "@media": {
    "screen and (max-width: 768px)": {
      gridTemplateColumns: "1fr",
      gap: vars.space[8],
      padding: `0 ${vars.space[6]}`,
    },
  },
});

export const leftPanel = style({
  position: "sticky",
  top: 0,
  height: "100vh",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  padding: `${vars.space[20]} 0`,
  "@media": {
    "screen and (max-width: 768px)": {
      position: "relative",
      height: "auto",
      padding: `${vars.space[12]} 0 0 0`,
    },
  },
});

export const rightContent = style({
  padding: `${vars.space[20]} 0`,
  "@media": {
    "screen and (max-width: 768px)": {
      padding: `0 0 ${vars.space[12]} 0`,
    },
  },
});

export const name = style({
  fontSize: vars.fontSize.h1,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.foreground,
  margin: 0,
});

export const title = style({
  fontSize: vars.fontSize.xl,
  fontWeight: 400,
  //color: vars.color.mutedForeground,
  lineHeight: vars.lineHeight.base,
  color: "rgb(226 232 240)",
  margin: 0,
  marginTop: vars.space[2]
});

export const bio = style({
  fontSize: vars.fontSize.base,
  color: vars.color.mutedForeground,
  margin: 0,
  marginTop: vars.space[4],
  maxWidth: "260px",
  lineHeight: vars.lineHeight.base
});

export const nav = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[4],
  listStyle: "none",
  padding: 0,
  margin: `${vars.space[10]} 0`,
  "@media": {
    "screen and (max-width: 768px)": {
      display: "none",
    },
  },
});

export const navItem = style({
  display: "flex",
  alignItems: "center",
  gap: "12px",
  cursor: "pointer",
  textDecoration: "none",
  outline: "none",
  backgroundColor: "transparent",
  border: "none",
});

export const navLine = style({
  height: "0.5px",
  backgroundColor: vars.color.mutedForeground,
  width: "32px",
  transition: "width 0.3s ease, background-color 0.3s ease",
  selectors: {
    [`${navItem}:hover &`]: {
      width: "64px",
      //backgroundColor: vars.color.ring,
      backgroundColor: "rgb(255, 255, 255)"
    },
  },
});

export const navLineActive = style({
  width: "64px",
  //backgroundColor: vars.color.ring,
  backgroundColor: "rgb(255, 255, 255)"
});

export const navText = style({
  fontSize: vars.fontSize.xs,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: vars.color.mutedForeground,
  transition: "color 0.3s ease",
  fontWeight: vars.fontWeight.semibold,
  selectors: {
    [`${navItem}:hover &`]: {
      //color: vars.color.ring,
      color: "rgb(255, 255, 255)"
    },
  },
});

export const navTextActive = style({
  //color: vars.color.ring,
  color: "rgb(255, 255, 255)"
});

export const socialLinks = style({
  display: "flex",
  gap: vars.space[4],
  listStyle: "none",
  padding: 0,
  margin: 0,
  "@media": {
    "screen and (max-width: 768px)": {
      marginTop: vars.space[6],
    },
  },
});

export const socialIcon = style({
  color: vars.color.mutedForeground,
  transition: "color 0.2s ease, transform 0.2s ease",
  display: "inline-flex",
  selectors: {
    "&:hover": {
      color: vars.color.foreground,
      transform: "translateY(-2px)",
    },
  },
});

export const bottomSection = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[4],
  marginTop: "auto",
});

export const togglersRow = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space[3],
});

export const themeToggleBtn = style({
  background: "transparent",
  border: "none",
  padding: vars.space[2],
  color: vars.color.mutedForeground,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: vars.radii.sm,
  transition: "color 0.2s ease, background-color 0.2s ease",
  selectors: {
    "&:hover": {
      color: vars.color.foreground,
      backgroundColor: vars.color.accent,
    },
  },
});

export const langToggleBtn = style({
  background: "transparent",
  border: "none",
  padding: `${vars.space[1]} ${vars.space[2]}`,
  color: vars.color.mutedForeground,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: vars.radii.sm,
  fontSize: vars.fontSize.xs,
  fontWeight: vars.fontWeight.bold,
  transition: "color 0.2s ease, background-color 0.2s ease",
  selectors: {
    "&:hover": {
      color: vars.color.foreground,
      backgroundColor: vars.color.accent,
    },
  },
});

export const spotlight = style({
  position: "fixed",
  inset: 0,
  pointerEvents: "none",
  zIndex: 0,
  background: `radial-gradient(
    600px circle at var(--x, 0px) var(--y, 0px),
    rgba(29, 78, 216, 0.15),
    transparent 80%
  )`,
  willChange: "background",
  transition: "background 0.15s ease",
});




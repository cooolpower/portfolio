import { style } from "@vanilla-extract/css";
import { vars } from "/styles/theme.css";

export const layout = style({
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  backgroundColor: vars.color.background,
  color: vars.color.foreground,
});

export const main = style({
  flex: 1,
});

export const footer = style({
  borderTop: `1px solid ${vars.color.border}`,
  padding: `${vars.space[6]} 0`,
  textAlign: "center",
  color: vars.color.muted,
  fontSize: vars.fontSize.sm,
});

import { style } from "@vanilla-extract/css";
import { vars } from "/styles/theme.css";

export const card = style({
  borderRadius: vars.radii.lg,
  border: `1px solid ${vars.color.border}`,
  backgroundColor: vars.color.card,
  color: vars.color.cardForeground,
  display: "flex",
  flexDirection: "column",
});

export const header = style({
  display: "flex",
  flexDirection: "column",
  padding: vars.space[6],
  gap: vars.space[2],
});

export const title = style({
  fontSize: vars.fontSize.xl,
  fontWeight: vars.fontWeight.semibold,
  lineHeight: vars.lineHeight.none,
  margin: 0,
});

export const description = style({
  fontSize: vars.fontSize.sm,
  color: vars.color.mutedForeground,
  margin: 0,
});

export const content = style({
  padding: `0 ${vars.space[6]} ${vars.space[6]} ${vars.space[6]}`,
  fontSize: vars.fontSize.base,
  lineHeight: vars.lineHeight.base,
});

export const footer = style({
  display: "flex",
  alignItems: "center",
  padding: `0 ${vars.space[6]} ${vars.space[6]} ${vars.space[6]}`,
  gap: vars.space[2],
});

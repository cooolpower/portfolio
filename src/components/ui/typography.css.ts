import { style } from "@vanilla-extract/css";
import { vars } from "/styles/theme.css";

export const title = style({
  fontSize: vars.fontSize.h1,
  fontWeight: vars.fontWeight.bold,
  lineHeight: vars.lineHeight.shorter,
  color: vars.color.foreground,
  margin: `0 0 ${vars.space[2]} 0`,
});

export const subtitle = style({
  fontSize: vars.fontSize.xl,
  fontWeight: vars.fontWeight.normal,
  lineHeight: vars.lineHeight.base,
  color: vars.color.mutedForeground,
  margin: `0 0 ${vars.space[4]} 0`,
});

export const paragraph = style({
  fontSize: vars.fontSize.base,
  lineHeight: vars.lineHeight.tall,
  color: vars.color.mutedForeground,
  margin: 0,
});

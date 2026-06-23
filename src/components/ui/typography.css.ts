import { style } from "@vanilla-extract/css";
import { vars } from "@/styles/theme.css";

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

export const paragraphBullet = style({
  fontSize: vars.fontSize.base,
  lineHeight: vars.lineHeight.short,
  color: vars.color.mutedForeground,
  margin: 0,
  //textIndent: "-13px",
  //paddingLeft: "12px",
  marginTop: vars.space[2],
  // selectors: {
  //   "&::before": {
  //     content: "•",
  //     color: vars.color.ring,
  //     display: "inline-block",
  //     width: "1em",
  //     textIndent: 0
  //   },
  // },
});

export const inlineTextHighlight = style({
  color: vars.color.foreground,
  fontWeight: "inherit",
  //fontWeight: vars.fontWeight.semibold,
});
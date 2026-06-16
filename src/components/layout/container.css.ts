import { style } from "@vanilla-extract/css";
import { vars } from "/styles/theme.css";

export const container = style({
  width: "100%",
  maxWidth: "800px",
  margin: "0 auto",
  paddingLeft: vars.space[4],
  paddingRight: vars.space[4],
});

export const section = style({
  display: "flex",
  flexDirection: "column",
  paddingTop: vars.space[16],
  paddingBottom: vars.space[16],
});

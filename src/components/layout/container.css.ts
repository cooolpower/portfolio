import { style } from "@vanilla-extract/css";
import { vars } from "@/styles/theme.css";

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
  opacity: 0,
  transform: "translateY(24px)",
  transition: "opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
});

export const sectionVisible = style({
  opacity: 1,
  transform: "translateY(0)",
});


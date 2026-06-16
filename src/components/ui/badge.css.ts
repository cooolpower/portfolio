import { style } from "@vanilla-extract/css";
import { vars } from "@/styles/theme.css";

export const badge = style({
  display: "inline-flex",
  alignItems: "center",
  borderRadius: vars.radii.full,
  backgroundColor: vars.color.accent,
  border: `1px solid ${vars.color.border}`,
  padding: `${vars.space[1]} ${vars.space[3]}`,
  fontSize: vars.fontSize.xs,
  fontWeight: vars.fontWeight.medium,
  color: vars.color.mutedForeground,
});

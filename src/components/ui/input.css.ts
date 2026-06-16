import { style } from "@vanilla-extract/css";
import { vars } from "@/styles/theme.css";

export const input = style({
  height: "40px",
  width: "100%",
  borderRadius: vars.radii.md,
  border: `1px solid ${vars.color.border}`,
  backgroundColor: "transparent",
  paddingLeft: vars.space[3],
  paddingRight: vars.space[3],
  fontSize: vars.fontSize.sm,
  color: vars.color.foreground,
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  outline: "none",
  selectors: {
    "&::placeholder": {
      color: vars.color.mutedForeground,
    },
    "&:focus": {
      borderColor: vars.color.ring,
      boxShadow: `0 0 0 2px ${vars.color.ring}22`,
    },
    "&:disabled": {
      cursor: "not-allowed",
      opacity: 0.5,
    },
  },
});

import { style, styleVariants } from "@vanilla-extract/css";
import { vars } from "@/styles/theme.css";

export const buttonBase = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: vars.radii.md,
  fontWeight: vars.fontWeight.medium,
  fontSize: vars.fontSize.sm,
  cursor: "pointer",
  transition:
    "background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease",
  border: "1px solid transparent",
  outline: "none",
  textDecoration: "none",
  selectors: {
    "&:focus-visible": {
      outline: `2px solid ${vars.color.ring}`,
      outlineOffset: "2px",
    },
    "&:disabled": {
      cursor: "not-allowed",
      opacity: 0.5,
    },
  },
});

export const variant = styleVariants({
  primary: {
    backgroundColor: vars.color.primary,
    color: vars.color.primaryForeground,
    selectors: {
      "&:hover:not(:disabled)": {
        opacity: 0.9,
      },
    },
  },
  secondary: {
    backgroundColor: vars.color.secondary,
    color: vars.color.secondaryForeground,
    selectors: {
      "&:hover:not(:disabled)": {
        opacity: 0.8,
      },
    },
  },
  outline: {
    backgroundColor: "transparent",
    border: `1px solid ${vars.color.border}`,
    color: vars.color.foreground,
    selectors: {
      "&:hover:not(:disabled)": {
        backgroundColor: vars.color.accent,
        color: vars.color.accentForeground,
      },
    },
  },
  ghost: {
    backgroundColor: "transparent",
    color: vars.color.foreground,
    selectors: {
      "&:hover:not(:disabled)": {
        backgroundColor: vars.color.accent,
        color: vars.color.accentForeground,
      },
    },
  },
});

export const size = styleVariants({
  sm: {
    padding: `${vars.space[2]} ${vars.space[4]}`,
    height: "32px",
  },
  md: {
    padding: `${vars.space[3]} ${vars.space[6]}`,
    height: "40px",
  },
  lg: {
    padding: `${vars.space[4]} ${vars.space[8]}`,
    height: "48px",
  },
});

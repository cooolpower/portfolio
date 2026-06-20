import { style, keyframes } from "@vanilla-extract/css";
import { vars } from "@/styles/theme.css";

export const listContainer = style({
  listStyle: "none",
  padding: 0,
  margin: `${vars.space[4]} 0`,
  display: "flex",
  flexDirection: "column",
  gap: vars.space[3],
});

export const fadeUpKeyframes = keyframes({
  from: {
    opacity: 0,
    transform: "translateY(8px)",
  },
  to: {
    opacity: 1,
    transform: "translateY(0)",
  },
});

export const listItem = style({
  fontSize: vars.fontSize.sm,
  lineHeight: vars.lineHeight.base,
  color: vars.color.mutedForeground,
  position: "relative",
  paddingLeft: vars.space[5],
  cursor: "default",
  transition: "transform 0.2s ease, color 0.2s ease",

  // Initial animation state
  opacity: 0,
  transform: "translateY(8px)",

  selectors: {
    // Custom Marker
    "&::before": {
      content: '"▸"',
      position: "absolute",
      left: 0,
      top: "0.1em",
      color: vars.color.ring,
      fontSize: "1.1em",
      lineHeight: 1,
    },
    
    // Hover micro-interaction
    "&:hover": {
      transform: "translateX(4px)",
      color: vars.color.primary,
    },

    // When the item is in view (active animation class applied)
    "&.is-visible": {
      animationName: fadeUpKeyframes,
      animationDuration: "0.4s",
      animationTimingFunction: "ease-out",
      animationFillMode: "forwards",
      animationDelay: "calc(var(--stagger-index) * 60ms)",
    },
  },

  // Fallback for user preferences
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      opacity: 1,
      transform: "none",
      animationName: "none",
      animationDelay: "0s",
      selectors: {
        "&:hover": {
          transform: "none",
          color: vars.color.primary,
        },
        "&.is-visible": {
          animationName: "none",
          opacity: 1,
          transform: "none",
        },
      },
    },
  },
});

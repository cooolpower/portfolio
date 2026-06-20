import { style } from "@vanilla-extract/css";
import { vars } from "@/styles/theme.css";

export const card = style({
  borderRadius: vars.radii.lg,
  border: `1px solid ${vars.color.border}`,
  backgroundColor: vars.color.card,
  color: vars.color.cardForeground,
  display: "flex",
  flexDirection: "column",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  transition:
    "transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), border-color 0.3s ease, box-shadow 0.3s ease",
  selectors: {
    "&:hover": {
      transform: "translateY(-6px)",
      borderColor: vars.color.ring,
      boxShadow: "0 12px 30px rgba(0, 0, 0, 0.2)",
    },
  },
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
  color: vars.color.foreground,
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
  marginTop: "auto",
});

import { style } from "@vanilla-extract/css";
import { vars } from "@/styles/theme.css";

export const badge = style({
  display: "inline-flex",
  alignItems: "center",
  borderRadius: vars.radii.full,
  border: `1px solid ${vars.color.border}`,
  padding: `${vars.space[1]} ${vars.space[3]} 0.35rem`,
  fontSize: vars.fontSize.xs,
  fontWeight: vars.fontWeight.medium,
  color: vars.color.badgeForeground,
  backgroundColor: vars.color.badgeBackground
});

export const frontend = style({
  borderColor: "rgba(59, 130, 246, 0.4)", // blue-500
  color: "rgba(59, 130, 246, 1)",
});

export const backend = style({
  borderColor: "rgba(16, 185, 129, 0.4)", // emerald-500
  color: "rgba(16, 185, 129, 1)",
});

export const devops = style({
  borderColor: "rgba(139, 92, 246, 0.4)", // violet-500
  color: "rgba(139, 92, 246, 1)",
});

export const testing = style({
  borderColor: "rgba(239, 68, 68, 0.4)", // red-500 (Testing전용으로 빨강/핑크계열 변경)
  color: "rgba(239, 68, 68, 1)",
});

export const ide = style({
  borderColor: "rgba(245, 158, 11, 0.4)", // amber-500 (주황/옐로우 계열)
  color: "rgba(245, 158, 11, 1)",
});

import { style, keyframes } from "@vanilla-extract/css";
import { vars } from "@/styles/theme.css";

const fadeIn = keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
});

const scaleUp = keyframes({
  from: {
    opacity: 0,
    transform: "scale(0.95) translateY(10px)",
  },
  to: {
    opacity: 1,
    transform: "scale(1) translateY(0)",
  },
});

export const modalOverlay = style({
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  backdropFilter: "blur(4px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
  padding: vars.space[4],
  animationName: fadeIn,
  animationDuration: "0.2s",
  animationTimingFunction: "ease-out",
  animationFillMode: "forwards",
  "@media": {
    "screen and (max-width: 640px)": {
      padding: 0,
    },
  },
});

export const modalContent = style({
  backgroundColor: vars.color.background,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radii.lg,
  width: "100%",
  maxWidth: "500px",
  maxHeight: "90vh",
  display: "flex",
  flexDirection: "column",
  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.1)",
  overflow: "hidden",
  animationName: scaleUp,
  animationDuration: "0.25s",
  animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
  animationFillMode: "forwards",
  "@media": {
    "screen and (max-width: 640px)": {
      maxWidth: "100%",
      maxHeight: "100vh",
      height: "100%",
      borderRadius: 0,
      border: "none",
    },
  },
});

export const modalHeader = style({
  padding: `${vars.space[4]} ${vars.space[5]}`,
  borderBottom: `1px solid ${vars.color.border}`,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  backgroundColor: vars.color.secondary,
});

export const modalTitle = style({
  fontSize: vars.fontSize.base,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.foreground,
  margin: 0,
});

export const closeBtn = style({
  background: "transparent",
  border: "none",
  color: vars.color.mutedForeground,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: vars.space[1],
  borderRadius: vars.radii.md,
  transition: "background-color 0.2s, color 0.2s",
  ":hover": {
    backgroundColor: vars.color.border,
    color: vars.color.foreground,
  },
});

export const modalBody = style({
  padding: vars.space[5],
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
  gap: vars.space[4],
  backgroundColor: vars.color.background,
});

export const formField = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[2],
});

export const formLabel = style({
  fontSize: vars.fontSize.xs,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.mutedForeground,
});

export const formInput = style({
  padding: `${vars.space[2]} ${vars.space[3]}`,
  borderRadius: vars.radii.md,
  border: `1px solid ${vars.color.border}`,
  backgroundColor: vars.color.secondary,
  color: vars.color.foreground,
  fontSize: vars.fontSize.sm,
  outline: "none",
  transition: "border-color 0.2s, box-shadow 0.2s",
  ":focus": {
    borderColor: vars.color.ring,
    boxShadow: `0 0 0 2px ${vars.color.ring}20`,
  },
});

export const formTextarea = style({
  padding: `${vars.space[2]} ${vars.space[3]}`,
  borderRadius: vars.radii.md,
  border: `1px solid ${vars.color.border}`,
  backgroundColor: vars.color.secondary,
  color: vars.color.foreground,
  fontSize: vars.fontSize.sm,
  outline: "none",
  minHeight: "150px",
  resize: "vertical",
  transition: "border-color 0.2s, box-shadow 0.2s",
  ":focus": {
    borderColor: vars.color.ring,
    boxShadow: `0 0 0 2px ${vars.color.ring}20`,
  },
});

export const errorMsg = style({
  fontSize: vars.fontSize.xs,
  color: "#ef4444",
  marginTop: vars.space[1],
});

export const successMsg = style({
  fontSize: vars.fontSize.xs,
  color: "#10b981",
  marginTop: vars.space[1],
});

export const footer = style({
  display: "flex",
  justifyContent: "flex-end",
  gap: vars.space[3],
  padding: `${vars.space[4]} ${vars.space[5]}`,
  borderTop: `1px solid ${vars.color.border}`,
  backgroundColor: vars.color.secondary,
  "@media": {
    "screen and (max-width: 640px)": {
      padding: vars.space[4],
    },
  },
});

export const submitBtn = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: vars.space[2],
  padding: `${vars.space[2]} ${vars.space[4]}`,
  backgroundColor: vars.color.ring,
  color: vars.color.background,
  border: "none",
  borderRadius: vars.radii.md,
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.semibold,
  cursor: "pointer",
  transition: "opacity 0.2s, transform 0.1s",
  ":hover": {
    opacity: 0.9,
  },
  ":active": {
    transform: "scale(0.98)",
  },
  ":disabled": {
    opacity: 0.5,
    cursor: "not-allowed",
    transform: "none",
  },
});

export const cancelBtn = style({
  padding: `${vars.space[2]} ${vars.space[4]}`,
  backgroundColor: "transparent",
  color: vars.color.foreground,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radii.md,
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.semibold,
  cursor: "pointer",
  transition: "background-color 0.2s",
  ":hover": {
    backgroundColor: vars.color.border,
  },
});

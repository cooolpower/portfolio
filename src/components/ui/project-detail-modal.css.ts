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
  backgroundColor: "rgba(0, 0, 0, 0.4)",
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
  maxWidth: "680px",
  maxHeight: "85vh",
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
  padding: `${vars.space[5]} ${vars.space[6]}`,
  borderBottom: `1px solid ${vars.color.border}`,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "start",
  gap: vars.space[4],
  backgroundColor: vars.color.secondary,
});

export const modalPeriod = style({
  fontSize: vars.fontSize.xs,
  color: vars.color.ring,
  fontWeight: vars.fontWeight.semibold,
});

export const modalTitle = style({
  fontSize: vars.fontSize.lg,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.foreground,
  margin: `${vars.space[1]} 0 0 0`,
});

export const modalSubtitle = style({
  fontSize: vars.fontSize.xs,
  color: vars.color.mutedForeground,
  margin: `${vars.space[1]} 0 0 0`,
});

export const closeBtn = style({
  background: "transparent",
  border: "none",
  color: vars.color.mutedForeground,
  cursor: "pointer",
  padding: vars.space[1],
  borderRadius: vars.radii.sm,
  display: "inline-flex",
  transition: "color 0.15s ease, background-color 0.15s ease",
  ":hover": {
    color: vars.color.foreground,
    backgroundColor: vars.color.accent,
  },
});

export const modalBody = style({
  padding: vars.space[6],
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
  gap: vars.space[8],
  flex: 1,
});

export const sectionBlock = style({
  width: "100%",
});

export const imageGallery = style({
  display: "flex",
  gap: vars.space[4],
  overflowX: "auto",
  scrollSnapType: "x mandatory",
  paddingBottom: vars.space[2],
  selectors: {
    "&::-webkit-scrollbar": {
      height: "6px",
    },
    "&::-webkit-scrollbar-track": {
      backgroundColor: "rgba(0, 0, 0, 0.05)",
      borderRadius: "3px",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      borderRadius: "3px",
    },
  },
});

export const galleryImage = style({
  width: "85%",
  maxWidth: "480px",
  height: "auto",
  maxHeight: "280px",
  objectFit: "cover",
  borderRadius: vars.radii.md,
  border: `1px solid ${vars.color.border}`,
  flexShrink: 0,
  scrollSnapAlign: "start",
  transition: "transform 0.2s ease",
  selectors: {
    "&:only-child": {
      width: "100%",
      maxWidth: "100%",
      maxHeight: "360px",
    },
  },
  "@media": {
    "screen and (max-width: 640px)": {
      width: "90%",
      maxHeight: "200px",
      selectors: {
        "&:only-child": {
          width: "100%",
          maxHeight: "240px",
        },
      },
    },
  },
});

export const summaryText = style({
  fontSize: vars.fontSize.base,
  lineHeight: vars.lineHeight.base,
  color: vars.color.mutedForeground,
  margin: 0,
});

export const linksRow = style({
  display: "flex",
  gap: vars.space[3],
  flexWrap: "wrap",
});

export const linkButton = style({
  display: "inline-flex",
  alignItems: "center",
  gap: vars.space[2],
  padding: `${vars.space[2]} ${vars.space[4]}`,
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.medium,
  color: vars.color.foreground,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radii.md,
  textDecoration: "none",
  transition: "background-color 0.15s ease, border-color 0.15s ease",
  ":hover": {
    backgroundColor: vars.color.secondary,
    borderColor: vars.color.ring,
  },
});

export const techStackList = style({
  display: "flex",
  flexWrap: "wrap",
  gap: vars.space[2],
});

export const subBlockTitle = style({
  fontSize: vars.fontSize.lg,
  fontWeight: vars.fontWeight.semibold,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: vars.color.foreground,
  margin: `0 0 ${vars.space[3]} 0`,
});

export const metricsGrid = style({
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: vars.space[4],
  "@media": {
    "screen and (max-width: 640px)": {
      gridTemplateColumns: "1fr",
    },
  },
});

export const metricCard = style({
  backgroundColor: vars.color.secondary,
  padding: vars.space[4],
  borderRadius: vars.radii.md,
  border: `1px solid ${vars.color.border}`,
  display: "flex",
  flexDirection: "column",
  gap: vars.space[1],
});

export const metricVal = style({
  fontSize: vars.fontSize.xl,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.ring,
});

export const metricLabel = style({
  fontSize: vars.fontSize.xs,
  color: vars.color.mutedForeground,
});

export const troubleContainer = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[6],
});

export const troubleCard = style({
  backgroundColor: vars.color.secondary,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radii.lg,
  padding: vars.space[5],
  display: "flex",
  flexDirection: "column",
  gap: vars.space[4],
});

export const boldHighlight = style({
  color: vars.color.foreground,
  fontWeight: vars.fontWeight.semibold,
});

export const inlineCode = style({
  fontFamily: vars.font.mono,
  fontSize: "0.85em",
  backgroundColor: "rgba(255, 255, 255, 0.05)",
  color: vars.color.ring,
  padding: "2px 6px",
  borderRadius: vars.radii.sm,
  border: `1px solid ${vars.color.border}`,
  margin: "0 2px",
  verticalAlign: "middle",
});

export const impactNumber = style({
  color: "#22c55e",
  fontWeight: vars.fontWeight.bold,
  fontSize: "1.1em",
  margin: "0 1px",
});

export const fieldHeader = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space[2],
  marginBottom: vars.space[1],
});

export const fieldLabel = style({
  fontSize: vars.fontSize.xs,
  fontWeight: vars.fontWeight.bold,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  margin: 0,
});

export const fieldValue = style({
  fontSize: vars.fontSize.sm,
  lineHeight: vars.lineHeight.base,
  color: vars.color.mutedForeground,
  margin: 0,
  paddingLeft: "24px",
});

const troubleFieldBase = style({
  padding: vars.space[4],
  borderLeftWidth: "4px",
  borderLeftStyle: "solid",
  borderTopRightRadius: vars.radii.md,
  borderBottomRightRadius: vars.radii.md,
  borderTopLeftRadius: "0px",
  borderBottomLeftRadius: "0px",
  display: "flex",
  flexDirection: "column",
  gap: vars.space[1],
});

export const troubleFieldProblem = style([
  troubleFieldBase,
  {
    borderLeftColor: "#ef4444",
    backgroundColor: "rgba(239, 68, 68, 0.03)",
  },
]);

export const troubleFieldSolution = style([
  troubleFieldBase,
  {
    borderLeftColor: vars.color.ring,
    backgroundColor: vars.color.accent,
  },
]);

export const troubleFieldImpact = style([
  troubleFieldBase,
  {
    borderLeftColor: "#22c55e",
    backgroundColor: "rgba(34, 197, 94, 0.03)",
  },
]);

export const iconProblem = style({
  color: "#ef4444",
});

export const iconSolution = style({
  color: vars.color.ring,
});

export const iconImpact = style({
  color: "#22c55e",
});

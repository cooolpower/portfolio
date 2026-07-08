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
  //maxWidth: "680px",
  maxWidth: "90%",
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
  minHeight: "280px",
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

export const galleryImageLandscape = style({
  width: "100%",
  maxHeight: "fit-content",
  objectFit: "cover",
  borderRadius: vars.radii.md,
});

export const galleryImagePortrait = style({
  height: "100%",
  maxWidth: "fit-content",
  objectFit: "cover",
  borderRadius: vars.radii.md,
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
  padding: `${vars.space[6]} ${vars.space[6]} ${vars.space[1]} ${vars.space[6]}`,
  display: "flex",
  flexDirection: "column",
  gap: 0,
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
  fontSize: vars.fontSize.sm,
  //fontWeight: vars.fontWeight.bold,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  margin: 0,
});

export const fieldValue = style({
  fontSize: vars.fontSize.sm,
  lineHeight: vars.lineHeight.base,
  color: vars.color.fieldValueColor,
  margin: 0,
  paddingLeft: 0,
});

export const troubleItem = style({
  display: "flex",
  gap: vars.space[4],
  position: "relative",
  selectors: {
    "&:last-child": {
      marginBottom: 0,
    },
  },
});

export const troubleTimeline = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  width: "16px",
  flexShrink: 0,
});

export const timelineDot = style({
  width: "8px",
  height: "8px",
  borderRadius: "50%",
  marginTop: "6px",
  zIndex: 2,
  selectors: {
    "&.problem": {
      backgroundColor: "#ef4444",
      boxShadow: "0 0 8px rgba(239, 68, 68, 0.5)",
    },
    "&.solution": {
      backgroundColor: vars.color.ring,
      boxShadow: `0 0 8px ${vars.color.ring}`,
    },
    "&.impact": {
      backgroundColor: "#22c55e",
      boxShadow: "0 0 8px rgba(34, 197, 94, 0.5)",
    },
  },
});

export const timelineLine = style({
  width: "2px",
  flex: 1,
  backgroundColor: vars.color.border,
  marginTop: vars.space[2],
  marginBottom: vars.space[2],
});

export const troubleContent = style({
  flex: 1,
  paddingBottom: vars.space[6],
});

export const iconProblem = style({
  color: "#ef4444",
});

export const iconSolution = style({
  color: vars.color.ring,
});

export const iconImpact = style({
  color: "#22c55e",
});

// Carousel Slider & Video Styles
export const carouselContainer = style({
  position: "relative",
  width: "100%",
  background: "#080c14",
  borderRadius: vars.radii.lg,
  border: `1px solid ${vars.color.border}`,
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  aspectRatio: "19/10",
  minHeight: "360px",
  "@media": {
    "screen and (max-width: 640px)": {
      minHeight: "240px",
    },
  },
});

export const carouselViewport = style({
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
});

export const carouselSlide = style({
  width: "100%",
  height: "100%",
  display: "none",
  alignItems: "center",
  justifyContent: "center",
  selectors: {
    "&.active": {
      display: "flex",
    },
  },
});

export const galleryVideo = style({
  width: "100%",
  height: "100%",
  objectFit: "cover",
  background: "#000",
});

export const carouselNavBtn = style({
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  width: "40px",
  height: "40px",
  borderRadius: "50%",
  background: "rgba(0, 0, 0, 0.4)",
  border: "none",
  color: "#fff",
  cursor: "pointer",
  zIndex: 10,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "background 0.2s ease, transform 0.2s ease",
  selectors: {
    "&:hover": {
      background: "rgba(0, 0, 0, 0.7)",
      transform: "translateY(-50%) scale(1.05)",
    },
    "&:active": {
      transform: "translateY(-50%) scale(0.95)",
    },
  },
});

export const prevBtn = style([
  carouselNavBtn,
  {
    left: "16px",
  },
]);

export const nextBtn = style([
  carouselNavBtn,
  {
    right: "16px",
  },
]);

export const carouselCounter = style({
  position: "absolute",
  bottom: "16px",
  right: "16px",
  padding: "4px 8px",
  background: "rgba(0, 0, 0, 0.6)",
  borderRadius: "12px",
  color: "#fff",
  fontSize: "11px",
  fontFamily: "monospace",
  fontWeight: "bold",
  zIndex: 10,
  userSelect: "none",
});

export const portraitBody = style({
  "@media": {
    "screen and (min-width: 769px)": {
      display: "grid",
      gridTemplateColumns: "5fr 7fr",
      gap: vars.space[8],
      alignItems: "start",
      height: "calc(85vh - 90px)",
      overflowY: "hidden",
    },
  },
});

export const portraitContainer = style([
  carouselContainer,
  {
    aspectRatio: "9/14",
    maxWidth: "320px",
    width: "100%",
    margin: "0 auto",
    minHeight: "unset",
    "@media": {
      "screen and (max-width: 640px)": {
        maxWidth: "280px",
      },
    },
  },
]);

export const portraitScrollBlock = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[6],
  width: "100%",
  "@media": {
    "screen and (min-width: 769px)": {
      height: "100%",
      overflowY: "auto",
      paddingRight: vars.space[3],
      selectors: {
        "&::-webkit-scrollbar": {
          width: "4px",
        },
        "&::-webkit-scrollbar-track": {
          backgroundColor: "rgba(0, 0, 0, 0.05)",
          borderRadius: "2px",
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          borderRadius: "2px",
        },
      },
    },
  },
});

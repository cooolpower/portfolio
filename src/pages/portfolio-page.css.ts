import { style } from "@vanilla-extract/css";
import { vars } from "/styles/theme.css";

export const container = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[12],
});

export const header = style({
  borderBottom: `1px solid ${vars.color.border}`,
  paddingBottom: vars.space[8],
  display: "flex",
  flexDirection: "column",
  gap: vars.space[4],
});

export const links = style({
  display: "flex",
  gap: vars.space[4],
  marginTop: vars.space[4],
});

export const section = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[6],
});

export const sectionTitle = style({
  fontSize: vars.fontSize.h2,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.foreground,
  borderBottom: `1px solid ${vars.color.border}`,
  paddingBottom: vars.space[2],
  marginBottom: vars.space[2],
});

export const careerItem = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[3],
});

export const careerHeader = style({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "baseline",
  selectors: {
    "@media (max-width: 640px)": {
      flexDirection: "column",
      gap: vars.space[2],
    },
  },
});

export const companyName = style({
  fontSize: vars.fontSize.lg,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.foreground,
});

export const careerPeriod = style({
  fontSize: vars.fontSize.sm,
  color: vars.color.mutedForeground,
});

export const careerList = style({
  margin: 0,
  paddingLeft: vars.space[6],
  display: "flex",
  flexDirection: "column",
  gap: vars.space[2],
  color: vars.color.mutedForeground,
  lineHeight: vars.lineHeight.base,
});

export const projectGrid = style({
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: vars.space[6],
});

export const projectHeader = style({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
});

export const projectTitle = style({
  fontSize: vars.fontSize.lg,
  fontWeight: vars.fontWeight.semibold,
  margin: 0,
});

export const projectMeta = style({
  fontSize: vars.fontSize.sm,
  color: vars.color.mutedForeground,
});

export const projectTechs = style({
  display: "flex",
  flexWrap: "wrap",
  gap: vars.space[2],
});

export const projectDetails = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[2],
  fontSize: vars.fontSize.sm,
});

export const detailLabel = style({
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.foreground,
});

export const skillsContainer = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[6],
});

export const skillCategory = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[3],
});

export const skillCategoryTitle = style({
  fontSize: vars.fontSize.base,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.foreground,
  margin: 0,
});

export const skillBadgeList = style({
  display: "flex",
  flexWrap: "wrap",
  gap: vars.space[2],
});

export const contactForm = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[4],
  maxWidth: "500px",
  width: "100%",
  marginTop: vars.space[2],
});

export const detailContainer = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[6],
});

export const troubleBlock = style({
  borderLeft: `3px solid ${vars.color.primary}`,
  paddingLeft: vars.space[4],
  display: "flex",
  flexDirection: "column",
  gap: vars.space[2],
});

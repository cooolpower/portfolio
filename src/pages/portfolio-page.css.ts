import { style } from "@vanilla-extract/css";
import { vars } from "@/styles/theme.css";

export const pageWrapper = style({
  width: "100%",
});

export const container = style({
  display: "flex",
  flexDirection: "column",
});

export const section = style({
  display: "flex",
  flexDirection: "column",
  paddingBottom: vars.space[20], // 6rem equivalent (using space[20] = 5rem / 80px approx, let's keep vars tokens)
});

export const sectionLabel = style({
  fontSize: vars.fontSize.xs,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: vars.color.mutedForeground,
  marginBottom: vars.space[8],
  fontWeight: vars.fontWeight.semibold,
  margin: `0 0 ${vars.space[8]} 0`,
});

export const aboutSection = style({
  paddingTop: 0
})

export const aboutText = style({
  fontSize: vars.fontSize.base,
  lineHeight: vars.lineHeight.base,
  color: vars.color.mutedForeground,
  whiteSpace: "pre-wrap",
});

export const inlineTextHighlight = style({
  color: vars.color.foreground,
  fontWeight: "inherit",
  //fontWeight: vars.fontWeight.semibold,
});

export const experienceList = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[6],
});

export const experienceRow = style({
  display: "grid",
  gridTemplateColumns: "3fr 7fr",
  gap: vars.space[6],
  padding: `${vars.space[6]} ${vars.space[4]}`,
  borderRadius: vars.radii.md,
  transition: "background-color 0.15s ease, transform 0.15s ease",
  cursor: "default",
  selectors: {
    "&:hover": {
      //backgroundColor: vars.color.accent,
      backgroundColor: vars.color.rowBackground,
      boxShadow: "0 0 #0000"
    },
  },
  "@media": {
    "screen and (max-width: 640px)": {
      gridTemplateColumns: "1fr",
      gap: vars.space[2],
    },
  },
});

export const expDate = style({
  fontSize: vars.fontSize.xs,
  color: vars.color.mutedForeground,
  //paddingTop: "4px",
});

export const expTitleContainer = style({
  display: "flex",
  flexDirection: "row",
  gap: vars.space[2],
  alignItems: "baseline",
});

export const expRoleTitle = style({
  fontSize: vars.fontSize.sm,
  fontWeight: "400",
  color: "#e3e3e3",
  margin: 0,
});

export const expCompanyTitle = style({
  fontSize: vars.fontSize.base,
  color: vars.color.foreground,
  margin: 0,
});

export const expDescription = style({
  fontSize: vars.fontSize.base,
  //color: vars.color.mutedForeground,
  color: "rgb(148, 163, 184)",
  marginTop: vars.space[2],
  lineHeight: vars.lineHeight.short,
});

export const expTechs = style({
  display: "flex",
  flexWrap: "wrap",
  gap: vars.space[2],
  marginTop: vars.space[6],
});

export const resumeLink = style({
  display: "inline-flex",
  alignItems: "center",
  marginTop: vars.space[6],
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.foreground,
  textDecoration: "none",
  selectors: {
    "&:hover": {
      textDecoration: "underline",
      color: vars.color.ring,
    },
  },
});

export const projectGrid = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[8],
});

export const projectRow = style({
  selectors: {
    "&:hover": {
      backgroundColor: vars.color.accent,
    },
  },
});

export const projectCardWrapper = style({
  display: "grid",
  gridTemplateColumns: "auto 1fr",
  gap: vars.space[6],
  alignItems: "start",
  "@media": {
    "screen and (max-width: 640px)": {
      gridTemplateColumns: "1fr",
    },
  },
});

export const projectThumb = style({
  width: "80px",
  height: "60px",
  borderRadius: vars.radii.sm,
  objectFit: "cover",
  border: `1px solid ${vars.color.border}`,
});

export const projectTitleContainer = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
});

export const projectTitle = style({
  fontSize: vars.fontSize.base,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.foreground,
  margin: 0,
  transition: "color 0.2s ease",
  selectors: {
    [`${projectRow}:hover &`]: {
      color: vars.color.ring,
    },
  },
});

export const linkIcon = style({
  opacity: 0,
  transition: "opacity 0.2s ease, transform 0.2s ease, color 0.2s ease",
  color: vars.color.foreground,
  selectors: {
    [`${projectRow}:hover &`]: {
      opacity: 1,
      transform: "translate(2px, -2px)",
      color: vars.color.ring,
    },
  },
});

export const projectDescription = style({
  fontSize: vars.fontSize.sm,
  color: vars.color.mutedForeground,
  lineHeight: vars.lineHeight.tall,
  margin: `${vars.space[2]} 0 0 0`,
});

export const projectTechs = style({
  display: "flex",
  flexWrap: "wrap",
  gap: vars.space[2],
  marginTop: vars.space[4],
});

export const skillsContainer = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[8],
});

export const skillCategory = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[3],
});

export const skillCategoryTitle = style({
  fontSize: vars.fontSize.sm,
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
  gap: vars.space[5],
  maxWidth: "500px",
  width: "100%",
});

export const formField = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[2],
});

export const formLabel = style({
  fontSize: vars.fontSize.xs,
  fontWeight: vars.fontWeight.medium,
  color: vars.color.mutedForeground,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
});

export const successMessage = style({
  color: "#10b981",
  fontSize: vars.fontSize.sm,
  marginTop: vars.space[2],
});

export const detailContainer = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[6],
  marginTop: vars.space[6],
});

export const detailSubtitle = style({
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.foreground,
  marginBottom: vars.space[2],
  marginTop: vars.space[4],
});

export const troubleBlock = style({
  borderLeft: `3px solid ${vars.color.primary}`,
  paddingLeft: vars.space[4],
  display: "flex",
  flexDirection: "column",
  gap: vars.space[4],
});

export const troubleItem = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[1],
});

export const highlightText = style({
  color: vars.color.foreground,
  fontWeight: vars.fontWeight.semibold,
});

export const detailText = style({
  color: vars.color.mutedForeground,
});

export const metricWrapper = style({
  display: "flex",
  gap: vars.space[4],
  marginTop: vars.space[4],
});

export const metricBox = style({
  backgroundColor: vars.color.secondary,
  padding: vars.space[3],
  borderRadius: vars.radii.sm,
  flex: 1,
  textAlign: "center",
});

export const metricValue = style({
  fontSize: vars.fontSize.h3,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.foreground,
});

export const metricLabel = style({
  fontSize: vars.fontSize.xs,
  color: vars.color.mutedForeground,
});

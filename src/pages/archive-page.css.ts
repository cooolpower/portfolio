import { style } from "@vanilla-extract/css";
import { vars } from "@/styles/theme.css";

export const archiveWrapper = style({
  minHeight: "100vh",
  width: "100%",
  padding: `${vars.space[16]} ${vars.space[6]}`,
  "@media": {
    "screen and (max-width: 640px)": {
      padding: `${vars.space[8]} ${vars.space[4]}`,
    },
  },
});

export const archiveContainer = style({
  maxWidth: "1000px",
  margin: "0 auto",
  display: "flex",
  flexDirection: "column",
});

export const backLink = style({
  display: "inline-flex",
  alignItems: "center",
  gap: vars.space[2],
  background: "none",
  border: "none",
  padding: 0,
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.ring,
  cursor: "pointer",
  textDecoration: "none",
  marginBottom: vars.space[6],
  width: "fit-content",
  transition: "transform 0.2s ease, color 0.2s ease",
  ":hover": {
    color: vars.color.ring,
    transform: "translateX(-4px)",
  },
});

export const archiveTitle = style({
  fontSize: vars.fontSize.h1,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.foreground,
  margin: 0,
  letterSpacing: "-0.02em",
  "@media": {
    "screen and (max-width: 640px)": {
      fontSize: vars.fontSize.h2,
    },
  },
});

export const archiveSubtitle = style({
  fontSize: vars.fontSize.base,
  color: vars.color.mutedForeground,
  margin: `${vars.space[2]} 0 ${vars.space[12]} 0`,
});

export const tableContainer = style({
  width: "100%",
  overflowX: "auto",
});

export const table = style({
  width: "100%",
  borderCollapse: "collapse",
  textAlign: "left",
});

export const tr = style({
  borderBottom: `1px solid ${vars.color.border}`,
  transition: "background-color 0.15s ease",
  selectors: {
    "&:hover": {
      backgroundColor: vars.color.rowBackground || vars.color.accent,
    },
  },
});

export const th = style({
  fontSize: vars.fontSize.xs,
  fontWeight: vars.fontWeight.semibold,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: vars.color.mutedForeground,
  padding: `${vars.space[4]} ${vars.space[3]}`,
  borderBottom: `1px solid ${vars.color.border}`,
});

export const td = style({
  fontSize: vars.fontSize.sm,
  padding: `${vars.space[4]} ${vars.space[3]}`,
  verticalAlign: "middle",
  color: vars.color.mutedForeground,
});

export const thYear = style([th, { width: "10%" }]);
export const thTitle = style([th, { width: "35%" }]);
export const thMadeAt = style([
  th,
  {
    width: "20%",
    "@media": {
      "screen and (max-width: 640px)": {
        display: "none",
      },
    },
  },
]);
export const thBuiltWith = style([
  th,
  {
    width: "25%",
    "@media": {
      "screen and (max-width: 640px)": {
        display: "none",
      },
    },
  },
]);
export const thLink = style([th, { width: "10%" }]);

export const tdYear = style([
  td,
  {
    color: vars.color.ring,
    fontWeight: vars.fontWeight.medium,
  },
]);

export const tdTitle = style([
  td,
  {
    color: vars.color.foreground,
    fontWeight: vars.fontWeight.semibold,
  },
]);

export const projTitleText = style({});
export const projSubtitleText = style({
  fontWeight: vars.fontWeight.normal,
  color: vars.color.mutedForeground,
  fontSize: vars.fontSize.xs,
});

export const tdMadeAt = style([
  td,
  {
    "@media": {
      "screen and (max-width: 640px)": {
        display: "none",
      },
    },
  },
]);

export const tdBuiltWith = style([
  td,
  {
    "@media": {
      "screen and (max-width: 640px)": {
        display: "none",
      },
    },
  },
]);

export const tdLink = style([td]);

export const badgeList = style({
  display: "flex",
  flexWrap: "wrap",
  gap: vars.space[2],
});

export const linkList = style({
  display: "flex",
  gap: vars.space[3],
  alignItems: "center",
});

export const iconLink = style({
  color: vars.color.mutedForeground,
  transition: "color 0.2s ease, transform 0.2s ease",
  display: "inline-flex",
  alignItems: "center",
  ":hover": {
    color: vars.color.ring,
    transform: "translateY(-2px)",
  },
});

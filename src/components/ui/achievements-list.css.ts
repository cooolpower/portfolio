import { style, keyframes } from "@vanilla-extract/css";
import { vars } from "@/styles/theme.css";

export const listContainer = style({
  listStyle: "none",
  padding: 0,
  margin: `${vars.space[4]} 0`,
  display: "flex",
  flexDirection: "column",
  gap: vars.space[1],
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
  //color: vars.color.mutedForeground,
  color: vars.color.listItemColor,
  position: "relative",
  paddingLeft: vars.space[4],
  cursor: "default",
  transition: "transform 0.2s ease, color 0.2s ease",

  // 초기 애니메이션 상태
  opacity: 0,
  transform: "translateY(8px)",

  selectors: {
    // 커스텀 마커 설정
    "&::before": {
      content: '"▸"',
      position: "absolute",
      left: 0,
      top: "0.1em",
      //color: vars.color.ring,
      color: vars.color.listItemBulletColor,
      fontSize: "1.1em",
      lineHeight: 1,
    },
    
    // 마우스 호버 마이크로 인터랙션
    "&:hover": {
      transform: "translateX(4px)",
      color: vars.color.primary,
    },

    // 뷰포트 노출 시 활성화되는 애니메이션 클래스
    "&.is-visible": {
      animationName: fadeUpKeyframes,
      animationDuration: "0.4s",
      animationTimingFunction: "ease-out",
      animationFillMode: "forwards",
      animationDelay: "calc(var(--stagger-index) * 60ms)",
    },
  },

  // 사용자의 모션 감소(reduced-motion) 선호 동작 대응 fallback
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

export const groupContainer = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[2],
  marginTop: vars.space[3],
  selectors: {
    "&:first-child": {
      marginTop: 0,
    },
    // 뷰포트 노출 시 활성화되는 애니메이션 클래스
    "&.is-visible": {
      animationName: fadeUpKeyframes,
      animationDuration: "0.4s",
      animationTimingFunction: "ease-out",
      animationFillMode: "forwards",
      animationDelay: "calc(var(--stagger-index) * 60ms)",
    },
  },
  // 초기 애니메이션 상태
  opacity: 0,
  transform: "translateY(8px)",
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      opacity: 1,
      transform: "none",
    },
  },
});

export const groupHeaderLink = style({
  display: "inline-flex",
  alignItems: "center",
  gap: vars.space[1],
  textDecoration: "none",
  color: "inherit",
  cursor: "pointer",
  marginTop: vars.space[2],
});

export const groupLinkIcon = style({
  opacity: 0.5,
  transition: "opacity 0.2s ease, transform 0.2s ease, color 0.2s ease",
  color: vars.color.mutedForeground,
  selectors: {
    [`${groupHeaderLink}:hover &`]: {
      opacity: 1,
      transform: "translate(1px, -1px)",
      color: vars.color.ring,
    },
  },
});

export const groupHeader = style({
  fontSize: vars.fontSize.sm,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.foreground,
  margin: 0,
  marginTop: vars.space[2],
  transition: "color 0.2s ease",
  selectors: {
    [`${groupHeaderLink}:hover &`]: {
      color: vars.color.ring,
    },
    [`${groupHeaderLink} &`]: {
      marginTop: 0,
    },
  },
});

export const subList = style({
  listStyle: "none",
  padding: 0,
  margin: 0,
  paddingLeft: vars.space[2], // Indent grouped items slightly
  display: "flex",
  flexDirection: "column",
  gap: vars.space[2],
});

export const groupListItem = style({
  fontSize: vars.fontSize.sm,
  lineHeight: vars.lineHeight.base,
  color: vars.color.listItemColor,
  position: "relative",
  paddingLeft: vars.space[4],
  cursor: "default",
  transition: "transform 0.2s ease, color 0.2s ease",
  selectors: {
    "&::before": {
      content: '"▸"',
      position: "absolute",
      left: 0,
      top: "0.1em",
      color: vars.color.listItemBulletColor,
      fontSize: "1.1em",
      lineHeight: 1,
    },
    "&:hover": {
      transform: "translateX(4px)",
      color: vars.color.primary,
    },
  },
});

export const groupTechs = style({
  display: "flex",
  flexWrap: "wrap",
  gap: vars.space[2],
  marginTop: vars.space[2],
  marginBottom: vars.space[4],
  paddingLeft: vars.space[2],
});


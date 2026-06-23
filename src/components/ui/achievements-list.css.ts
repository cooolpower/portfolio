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

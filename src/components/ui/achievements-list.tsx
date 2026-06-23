import { useEffect, useRef, useState } from "react";
import { parseHighlight } from "@/utils/parse-highlight";
import * as styles from "./achievements-list.css";

interface AchievementsListProps {
  items: string[];
}

export function AchievementsList({ items }: AchievementsListProps) {
  const containerRef = useRef<HTMLUListElement>(null);
  const [visibleIndices, setVisibleIndices] = useState<Set<number>>(new Set());

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 불필요한 observer 로직을 방지하기 위해 prefers-reduced-motion 설정 확인
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      // 즉시 모든 아이템을 보임 상태로 전환
      setVisibleIndices(new Set(items.map((_, i) => i)));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const indexAttr = entry.target.getAttribute("data-index");
            if (indexAttr !== null) {
              const index = parseInt(indexAttr, 10);
              setVisibleIndices((prev) => {
                const next = new Set(prev);
                next.add(index);
                return next;
              });
              // 뷰포트에 노출된 요소는 관찰을 해제함
              observer.unobserve(entry.target);
            }
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px", // 뷰포트에 완전히 들어오기 직전에 트리거
      }
    );

    const children = container.children;
    for (let i = 0; i < children.length; i++) {
      observer.observe(children[i]);
    }

    return () => {
      observer.disconnect();
    };
  }, [items]);

  return (
    <ul ref={containerRef} className={styles.listContainer}>
      {items.map((item, index) => {
        const isVisible = visibleIndices.has(index);
        return (
          <li
            key={item}
            data-index={index}
            className={`${styles.listItem} ${isVisible ? "is-visible" : ""}`}
            style={{
              // vanilla-extract의 stagger delay 계산을 위한 커스텀 CSS 변수 주입
              ["--stagger-index" as any]: index,
            }}
          >
            {parseHighlight(item)}
          </li>
        );
      })}
    </ul>
  );
}

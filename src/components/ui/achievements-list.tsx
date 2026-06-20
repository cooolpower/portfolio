import { useEffect, useRef, useState } from "react";
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

    // Check prefers-reduced-motion to avoid unnecessary observer logic
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      // Instantly make all items visible
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
              // Stop observing once it has become visible
              observer.unobserve(entry.target);
            }
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px", // triggers slightly before fully in view
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
              // Inject custom CSS property for vanilla-extract stagger delay calculation
              ["--stagger-index" as any]: index,
            }}
          >
            {item}
          </li>
        );
      })}
    </ul>
  );
}

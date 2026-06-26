import { useEffect, useRef, useState } from "react";
import { ExternalLink } from "lucide-react";
import { parseHighlight } from "@/utils/parse-highlight";
import * as styles from "./achievements-list.css";

interface AchievementsListProps {
  items: string[];
  groupLinks?: Record<string, string>;
}

export function AchievementsList({ items, groupLinks }: AchievementsListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleIndices, setVisibleIndices] = useState<Set<number>>(new Set());

  // Group consecutive items with the same [Group] prefix
  const groups: { name?: string; items: string[] }[] = [];
  let currentGroup: { name?: string; items: string[] } | null = null;

  for (const item of items) {
    const match = item.match(/^\[(.*?)\]\s*(.*)$/);
    if (match) {
      const groupName = match[1];
      const text = match[2];
      if (currentGroup && currentGroup.name === groupName) {
        currentGroup.items.push(text);
      } else {
        currentGroup = { name: groupName, items: [text] };
        groups.push(currentGroup);
      }
    } else {
      currentGroup = { name: undefined, items: [item] };
      groups.push(currentGroup);
    }
  }

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 불필요한 observer 로직을 방지하기 위해 prefers-reduced-motion 설정 확인
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      // 즉시 모든 아이템을 보임 상태로 전환
      setVisibleIndices(new Set(groups.map((_, i) => i)));
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
    <div ref={containerRef} className={styles.listContainer}>
      {groups.map((group, groupIndex) => {
        const isVisible = visibleIndices.has(groupIndex);
        if (group.name) {
          return (
            <div
              key={group.name}
              data-index={groupIndex}
              className={`${styles.groupContainer} ${isVisible ? "is-visible" : ""}`}
              style={{
                ["--stagger-index" as any]: groupIndex,
              }}
            >
              {groupLinks && groupLinks[group.name] ? (
                <a
                  href={groupLinks[group.name]}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.groupHeaderLink}
                >
                  <h4 className={styles.groupHeader}>
                    {parseHighlight(group.name)}
                  </h4>
                  <ExternalLink size={12} className={styles.groupLinkIcon} />
                </a>
              ) : (
                <h4 className={styles.groupHeader}>
                  {parseHighlight(group.name)}
                </h4>
              )}
              <ul className={styles.subList}>
                {group.items.map((subItem, subIndex) => (
                  <li key={subIndex} className={styles.groupListItem}>
                    {parseHighlight(subItem)}
                  </li>
                ))}
              </ul>
            </div>
          );
        }

        return (
          <div
            key={group.items[0]}
            data-index={groupIndex}
            className={`${styles.listItem} ${isVisible ? "is-visible" : ""}`}
            style={{
              ["--stagger-index" as any]: groupIndex,
            }}
          >
            {parseHighlight(group.items[0])}
          </div>
        );
      })}
    </div>
  );
}

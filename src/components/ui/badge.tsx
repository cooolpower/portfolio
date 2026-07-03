import type { ReactNode } from "react";
import * as styles from "./badge.css";

interface BadgeProps {
  children: ReactNode;
  className?: string;
  category?: string;
}

export function Badge({ children, className = "", category }: BadgeProps) {
  let categoryClass = "";
  if (category === "frontend") {
    categoryClass = styles.frontend;
  } else if (category === "backend") {
    categoryClass = styles.backend;
  } else if (category === "devops") {
    categoryClass = styles.devops;
  } else if (category === "testing") {
    categoryClass = styles.testing;
  } else if (category === "ide") {
    categoryClass = styles.ide;
  }

  return <span className={`${styles.badge} ${categoryClass} ${className}`}>{children}</span>;
}

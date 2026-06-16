import type { ReactNode } from "react";
import * as styles from "./badge.css";

interface BadgeProps {
  children: ReactNode;
  className?: string;
}

export function Badge({ children, className = "" }: BadgeProps) {
  return <span className={`${styles.badge} ${className}`}>{children}</span>;
}

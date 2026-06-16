import type { ReactNode } from "react";
import * as styles from "./typography.css";

interface HeadingProps {
  children: ReactNode;
  className?: string;
}

export function Title({ children, className = "" }: HeadingProps) {
  return <h1 className={`${styles.title} ${className}`}>{children}</h1>;
}

export function Subtitle({ children, className = "" }: HeadingProps) {
  return <p className={`${styles.subtitle} ${className}`}>{children}</p>;
}

export function Paragraph({ children, className = "" }: HeadingProps) {
  return <p className={`${styles.paragraph} ${className}`}>{children}</p>;
}

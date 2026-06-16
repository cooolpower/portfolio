import type { ReactNode } from "react";
import * as styles from "./container.css";

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

export function Container({ children, className = "" }: ContainerProps) {
  return <div className={`${styles.container} ${className}`}>{children}</div>;
}

interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

export function Section({ children, className = "", id }: SectionProps) {
  return (
    <section id={id} className={`${styles.section} ${className}`}>
      {children}
    </section>
  );
}

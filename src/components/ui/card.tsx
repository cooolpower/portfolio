import type { ReactNode } from "react";
import * as styles from "./card.css";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return <div className={`${styles.card} ${className}`}>{children}</div>;
}

export function CardHeader({ children, className = "" }: CardProps) {
  return <div className={`${styles.header} ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = "" }: CardProps) {
  return <h3 className={`${styles.title} ${className}`}>{children}</h3>;
}

export function CardDescription({ children, className = "" }: CardProps) {
  return <p className={`${styles.description} ${className}`}>{children}</p>;
}

export function CardContent({ children, className = "" }: CardProps) {
  return <div className={`${styles.content} ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = "" }: CardProps) {
  return <div className={`${styles.footer} ${className}`}>{children}</div>;
}

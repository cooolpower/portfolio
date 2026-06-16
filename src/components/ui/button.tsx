import type { ButtonHTMLAttributes, ReactNode } from "react";
import * as styles from "./button.css";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof styles.variant;
  size?: keyof typeof styles.size;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={`${styles.buttonBase} ${styles.variant[variant]} ${styles.size[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

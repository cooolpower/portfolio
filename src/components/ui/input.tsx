import type { InputHTMLAttributes } from "react";
import * as styles from "./input.css";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export function Input({ className = "", ...props }: InputProps) {
  return <input className={`${styles.input} ${className}`} {...props} />;
}

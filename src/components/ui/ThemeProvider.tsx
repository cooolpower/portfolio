import { useEffect, useState, type ReactNode } from "react";
import { darkThemeClass, lightThemeClass } from "@/styles/theme.css";
import { ThemeContext, type Theme } from "./ThemeContext";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || saved === "light") return saved;
    return window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  });

  useEffect(() => {
    localStorage.setItem("theme", theme);

    // globalStyle이 변수를 올바르게 해석할 수 있도록 body/html에 테마 클래스를 적용
    const body = document.body;
    body.classList.remove(darkThemeClass, lightThemeClass);
    body.classList.add(theme === "dark" ? darkThemeClass : lightThemeClass);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

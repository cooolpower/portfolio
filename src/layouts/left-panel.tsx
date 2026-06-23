import { ExternalLink, Github, Linkedin, Mail, Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import { PORTFOLIO_DATA_KO, PORTFOLIO_DATA_EN } from "@/constants/data";
import { useTheme } from "@/components/ui/ThemeContext";
import { useLanguage } from "@/components/ui/LanguageContext";
import { parseHighlight } from "@/utils/parse-highlight";
import * as styles from "./app-layout.css";

export function LeftPanel() {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const data = language === "ko" ? PORTFOLIO_DATA_KO : PORTFOLIO_DATA_EN;
  const { profile } = data;

  const navItems = [
    { id: "about", label: t("about") },
    { id: "projects", label: t("projects") },
    { id: "skills", label: t("skills") },
    { id: "contact", label: t("contact") },
  ];

  const [activeSection, setActiveSection] = useState("about");

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -60% 0px",
      threshold: 0,
    };

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      }
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);

    for (const item of navItems) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [language]); // Re-observe when items change due to language toggles

  const handleNavClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <aside className={styles.leftPanel}>
      {/* Top block */}
      <div>
        <h1 className={styles.name}>{profile.name}</h1>
        <h2 className={styles.title}>{profile.role}</h2>
        <p className={styles.bio}>{parseHighlight(profile.tagline)}</p>
      </div>

      {/* Middle block: Navigation */}
      <ul className={styles.nav}>
        {navItems.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <li key={item.id}>
              <button
                type="button"
                className={styles.navItem}
                onClick={() => handleNavClick(item.id)}
              >
                <span
                  className={`${styles.navLine} ${isActive ? styles.navLineActive : ""}`}
                />
                <span
                  className={`${styles.navText} ${isActive ? styles.navTextActive : ""}`}
                >
                  {item.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* Bottom block: Social Links & Theme Switcher */}
      <div className={styles.bottomSection}>
        <ul className={styles.socialLinks}>
          <li>
            <a
              href={profile.github}
              target="_blank"
              rel="noreferrer"
              className={styles.socialIcon}
            >
              <Github size={20} />
            </a>
          </li>
          <li>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              className={styles.socialIcon}
            >
              <Linkedin size={20} />
            </a>
          </li>
          <li>
            <a href={`mailto:${profile.email}`} className={styles.socialIcon}>
              <Mail size={20} />
            </a>
          </li>
          <li>
            <a
              href={profile.github}
              target="_blank"
              rel="noreferrer"
              className={styles.socialIcon}
            >
              <ExternalLink size={20} />
            </a>
          </li>
        </ul>

        <div className={styles.togglersRow}>
          <button
            type="button"
            onClick={toggleTheme}
            className={styles.themeToggleBtn}
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <button
            type="button"
            onClick={() => setLanguage(language === "ko" ? "en" : "ko")}
            className={styles.langToggleBtn}
            aria-label="Toggle Language"
          >
            {language === "ko" ? "EN" : "KO"}
          </button>
        </div>
      </div>
    </aside>
  );
}



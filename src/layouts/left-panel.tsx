import { Github, Mail, Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import { PORTFOLIO_DATA_KO, PORTFOLIO_DATA_EN } from "@/constants/data";
import { useTheme } from "@/components/ui/ThemeContext";
import { useLanguage } from "@/components/ui/LanguageContext";
import { parseHighlight } from "@/utils/parse-highlight";
import { EmailModal } from "@/components/ui/email-modal";
import * as styles from "./app-layout.css";

export function LeftPanel() {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, translate } = useLanguage();
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  const data = language === "ko" ? PORTFOLIO_DATA_KO : PORTFOLIO_DATA_EN;
  const { profile } = data;

  const navItems = [
    { id: "about", label: translate("about") },
    { id: "projects", label: translate("projects") },
    { id: "labs", label: translate("labs") },
    { id: "skills", label: translate("skills") },
    { id: "contact", label: translate("contact") },
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

          {/* <li>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              className={styles.socialIcon}
            >
              <Linkedin size={20} />
            </a>
          </li> */}
          <li>
            <button
              type="button"
              onClick={() => setIsEmailModalOpen(true)}
              className={styles.socialIcon}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
              aria-label="Send Email"
            >
              <Mail size={20} />
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={() => setLanguage(language === "ko" ? "en" : "ko")}
              className={styles.langToggleBtn}
              aria-label="Toggle Language"
            >
              {language === "ko" ? "EN" : "KO"}
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={toggleTheme}
              className={styles.themeToggleBtn}
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </li>
          {/* <li>
            <a
              href={profile.github}
              target="_blank"
              rel="noreferrer"
              className={styles.socialIcon}
            >
              <ExternalLink size={20} />
            </a>
          </li> */}
        </ul>
      </div>

      {isEmailModalOpen && (
        <EmailModal
          recipientEmail={profile.email}
          onClose={() => setIsEmailModalOpen(false)}
        />
      )}
    </aside>
  );
}

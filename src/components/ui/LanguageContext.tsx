import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Language = "ko" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations["en"]) => string;
}

const translations = {
  ko: {
    about: "소개",
    experience: "경력 사항",
    projects: "프로젝트",
    skills: "보유 기술",
    contact: "연락처",
    viewResume: "이력서 전체 보기 →",
    contactName: "이름",
    contactEmail: "이메일 주소",
    placeholderName: "이름을 입력해주세요",
    placeholderEmail: "your.email@example.com",
    sendMessage: "메시지 보내기",
    successMessage: "성공! 연락처 정보가 시뮬레이션되었습니다.",
  },
  en: {
    about: "About",
    experience: "Experience",
    projects: "Projects",
    skills: "Skills",
    contact: "Contact",
    viewResume: "View Full Résumé →",
    contactName: "Name",
    contactEmail: "Email Address",
    placeholderName: "Your Name",
    placeholderEmail: "your.email@example.com",
    sendMessage: "Send Message",
    successMessage: "Success! Your contact info has been simulated.",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("language");
    if (saved === "ko" || saved === "en") return saved;
    // Fallback to browser language
    const locale = navigator.language.toLowerCase();
    return locale.startsWith("ko") ? "ko" : "en";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
    
    // Toggle lang class and attribute on body element
    const body = document.body;
    body.classList.remove("lang-ko", "lang-en");
    body.classList.add(language === "ko" ? "lang-ko" : "lang-en");
    body.setAttribute("lang", language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: keyof typeof translations["en"]) => {
    return translations[language][key] || translations["en"][key];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

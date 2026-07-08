import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Language = "ko" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  translate: (key: keyof (typeof translations)["en"]) => string;
}

const translations = {
  ko: {
    about: "소개",
    experience: "경력사항",
    projects: "프로젝트",
    skills: "보유기술",
    labs: "실험실",
    contact: "연락처",
    viewResume: "이력서 전체 보기 →",
    viewArchive: "프로젝트 아카이브 전체보기 →",
    archiveTitle: "모든 프로젝트",
    archiveSubtitle: "내가 제작하거나 기여한 모든 프로젝트 목록입니다.",
    backToHome: "김현욱",
    tableYear: "연도",
    tableProject: "프로젝트",
    tableMadeAt: "제작처",
    tableBuiltWith: "기술 스택",
    tableLink: "링크",
    closeModal: "닫기",
    metricsTitle: "핵심 성과",
    tsTitle: "트러블 슈팅",
    tsProblem: "문제 상황",
    tsSolution: "해결 방안",
    tsImpact: "개선 효과",
    contactName: "이름",
    contactEmail: "이메일 주소",
    placeholderName: "이름을 입력해주세요",
    placeholderEmail: "your.email@example.com",
    sendMessage: "메시지 보내기",
    successMessage: "성공! 연락처 정보가 시뮬레이션되었습니다.",
    emailModalTitle: "이메일 보내기",
    emailModalSender: "보내는 사람 이메일",
    emailModalSubject: "제목",
    emailModalSubjectPlaceholder: "메일 제목을 입력해주세요",
    emailModalMessage: "내용",
    emailModalMessagePlaceholder: "내용을 입력해주세요",
    emailModalSend: "보내기",
    emailModalSending: "보내는 중...",
    emailModalErrorEmail: "올바른 이메일 주소를 입력해주세요.",
    emailModalErrorFields: "모든 필드를 입력해주세요.",
    emailModalSuccess: "메일 전송 요청이 완료되었습니다. 메일 앱으로 연결합니다.",
  },
  en: {
    about: "About",
    experience: "Experience",
    projects: "Projects",
    skills: "Skills",
    labs: "Labs",
    contact: "Contact",
    viewResume: "View Full Résumé →",
    viewArchive: "View Full Project Archive →",
    archiveTitle: "All Projects",
    archiveSubtitle: "A complete list of things I’ve built or contributed to.",
    backToHome: "James Kim",
    tableYear: "Year",
    tableProject: "Project",
    tableMadeAt: "Made at",
    tableBuiltWith: "Built with",
    tableLink: "Link",
    closeModal: "Close",
    metricsTitle: "Key Metrics",
    tsTitle: "Troubleshooting",
    tsProblem: "Problem",
    tsSolution: "Solution",
    tsImpact: "Impact",
    contactName: "Name",
    contactEmail: "Email Address",
    placeholderName: "Your Name",
    placeholderEmail: "your.email@example.com",
    sendMessage: "Send Message",
    successMessage: "Success! Your contact info has been simulated.",
    emailModalTitle: "Send Email",
    emailModalSender: "Your Email",
    emailModalSubject: "Subject",
    emailModalSubjectPlaceholder: "Enter subject",
    emailModalMessage: "Message",
    emailModalMessagePlaceholder: "Enter your message",
    emailModalSend: "Send",
    emailModalSending: "Sending...",
    emailModalErrorEmail: "Please enter a valid email address.",
    emailModalErrorFields: "Please fill in all fields.",
    emailModalSuccess: "Email request completed! Redirecting to mail client.",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

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

  const translate = (key: keyof (typeof translations)["en"]) => {
    return translations[language][key] || translations["en"][key];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, translate }}>
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

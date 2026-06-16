export interface TechStack {
  category: "frontend" | "backend" | "devops" | "testing";
  name: string;
  version?: string;
}

export interface Metric {
  label: string;
  value: string;
  description?: string;
}

export interface Troubleshooting {
  problem: string;
  solution: string;
  impact: string;
}

export interface Project {
  id: string;
  title: string;
  subtitle: string;
  role: string;
  period: {
    start: string;
    end: string | "Present";
  };
  techStack: TechStack[];
  summary: string;
  troubleshooting: Troubleshooting[];
  metrics: Metric[];
  links?: {
    github?: string;
    demo?: string;
    document?: string;
  };
}

export interface Career {
  company: string;
  role: string;
  period: string;
  description: string;
  achievements: string[];
}

export interface SkillCategory {
  title: string;
  skills: string[];
}

export interface PortfolioData {
  profile: {
    name: string;
    role: string;
    bio: string;
    github: string;
    email: string;
  };
  careers: Career[];
  projects: Project[];
  skills: SkillCategory[];
}

export const PORTFOLIO_DATA: PortfolioData = {
  profile: {
    name: "James (김재민)",
    role: "Frontend Engineer",
    bio: "사용자 경험과 아키텍처의 지속 가능성을 고민하는 프론트엔드 엔지니어입니다. 복잡한 시스템의 관심사 분리와 모듈러 아키텍처, 타입 안전성에 깊은 관심이 있습니다.",
    github: "https://github.com/cooolpower",
    email: "james@example.com",
  },
  careers: [
    {
      company: "Antigravity Studio",
      role: "Senior Frontend Engineer",
      period: "2024.03 - 현재",
      description:
        "웹 프레임워크 설계 및 마이크로 프론트엔드 시스템 구축 주도.",
      achievements: [
        "vanilla-extract 도입을 통한 런타임 CSS 오버헤드 0% 달성 및 LCP 1.5초 이내 개선",
        "공통 UI 컴포넌트 디자인 시스템 구축으로 프론트엔드 팀 개발 생산성 35% 향상",
        "전사 핵심 대시보드 모듈러 아키텍처 적용으로 코드 유지보수 비용 크게 절감",
      ],
    },
  ],
  projects: [
    {
      id: "design-system",
      title: "Enterprise Design System",
      subtitle: "Zero-runtime CSS 컴포넌트 라이브러리 설계 및 구현",
      role: "Lead Frontend Developer",
      period: {
        start: "2024.05",
        end: "2024.11",
      },
      techStack: [
        { category: "frontend", name: "React" },
        { category: "frontend", name: "TypeScript" },
        { category: "frontend", name: "vanilla-extract" },
        { category: "devops", name: "Vite" },
      ],
      summary:
        "서비스 스케일이 커짐에 따라 CSS-in-JS의 런타임 비용이 증가하고, UI 비일관성 문제 발생.",
      troubleshooting: [
        {
          problem:
            "CSS-in-JS의 런타임 오버헤드로 인한 동적 스타일 재계산 병목 현상 발생.",
          solution:
            "Vite와 vanilla-extract 기반의 Zero-runtime CSS 컴포넌트 라이브러리 구축.",
          impact: "초기 렌더링 성능 24% 개선 및 메인 번들 사이즈 15% 감소.",
        },
      ],
      metrics: [
        { label: "초기 렌더링 속도 개선", value: "24%" },
        { label: "UI 일관성 수치", value: "100%" },
      ],
      links: {
        github: "https://github.com/cooolpower/design-system-example",
      },
    },
    {
      id: "analytics-dashboard",
      title: "Global Analytics Dashboard",
      subtitle: "대용량 시계열 실시간 데이터 분석 대시보드 구축",
      role: "Frontend Architect",
      period: {
        start: "2025.01",
        end: "2025.05",
      },
      techStack: [
        { category: "frontend", name: "React" },
        { category: "frontend", name: "TypeScript" },
        { category: "frontend", name: "Zustand" },
        { category: "devops", name: "Vite" },
      ],
      summary:
        "대용량 시계열 데이터 렌더링 시 브라우저 병목으로 인한 잦은 프레임 드랍 발생.",
      troubleshooting: [
        {
          problem:
            "대용량 실시간 차트 업데이트 시 전체 페이지 리렌더링으로 프레임 드랍 현상.",
          solution:
            "상태 업데이트 단위를 Derived State로 최소화하고 React Window 및 가상화 적용.",
          impact:
            "초기 렌더링 속도 1.8초 단축 및 렌더링 메모리 점유율 40% 절감.",
        },
      ],
      metrics: [
        { label: "메모리 점유 감소", value: "40%" },
        { label: "렌더링 속도 개선", value: "1.8s" },
      ],
      links: {
        github: "https://github.com/cooolpower/dashboard-example",
      },
    },
  ],
  skills: [
    {
      title: "Frontend Development",
      skills: [
        "React",
        "TypeScript",
        "Next.js",
        "vanilla-extract",
        "Zustand",
        "Tailwind CSS",
      ],
    },
    {
      title: "Build Tooling & DevOps",
      skills: ["Vite", "Webpack", "Vercel", "GitHub Actions", "Docker"],
    },
  ],
};

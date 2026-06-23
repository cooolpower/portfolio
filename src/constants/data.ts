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
    end: string | "Present" | "현재";
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
  skills: string[];
}

export interface SkillCategory {
  title: string;
  skills: string[];
}

export interface PortfolioData {
  profile: {
    name: string;
    role: string;
    tagline: string;
    aboutMe: string;
    github: string;
    email: string;
  };
  careers: Career[];
  projects: Project[];
  skills: SkillCategory[];
}

export const PORTFOLIO_DATA_KO: PortfolioData = {
  profile: {
    name: "김현욱",
    role: "프론트엔드 개발자",
    tagline: "웹 환경에서 접근성 높고 완성도 높은 사용자 경험을 만듭니다.",
    aboutMe: "**디자인과 확장성 있는 엔지니어링의 교차점**에서 클린하고 시맨틱한 코드를 작성하며, 훌륭한 UX를 완성하는 미세한 디테일에 가치를 두는 프론트엔드 엔지니어입니다.\n\n이전에는 **웍스피어(Worksphere) FE플랫폼 팀**에서 동적 메뉴 엔진 설계, 접근 제어 등 팀 내 공통 플랫폼 레이어 설계를 주도했습니다. 또한 **잡코리아 핵심 도메인의 대규모 리뉴얼 퍼블리싱** 및 마크업 구조 정비를 이끌었으며, STOMP 프로토콜과 지수 백오프 자동 복구 알고리즘을 결합한 **고가용성 AI 채팅 아키텍처**를 구현했습니다.\n\n더불어 파트너십 서비스인 **토스알바 연동**을 위한 서버리스 API Gateway/Lambda 연동 인프라 구축을 총괄했으며, 하나은행, 알바몬, 게임잡 등 대형 트래픽 서비스의 **웹 표준/웹 접근성 인증마크 획득 대응**과 마크업 표준화를 전담했습니다. 스타트업부터 대기업 플랫폼에 이르는 다양한 크로스 브라우징 및 표준화 경험을 갖추고 있습니다.\n\n개발 외적인 시간에는 최신 웹 명세를 탐독하거나 새로운 UI 컨셉을 리서치하며 충전의 시간을 보냅니다.",
    github: "https://github.com/cooolpower",
    email: "developerjameskim@gmail.com",
  },
  careers: [
    {
      company: "웍스피어 유한책임회사",
      role: "FE플랫폼 팀 팀원",
      period: "2024.05 - 2026.01",
      description: "**플랫폼 레벨 기여** 및 **실시간 AI 채팅**, **외부 파트너십 API 연동** 주도.",
      achievements: [
        "**공통 헤더 컴포넌트 설계 및 개발**을 통한 팀 내 협업 컴포넌트 표준화",
        "**Admin 기반 메뉴 관리 구조 설계** 및 **동적 렌더링 시스템 구현**",
        "전역 네비게이션 상태 관리 및 **접근 제어(RBAC) 보안 로직 구현**",
        "레거시 코드 구조 개선 및 **렌더링 성능 최적화**",
        "**잡코리아 대규모 리뉴얼 프로젝트** 참여 (메인/검색/이력서/공고/로그인 UI 및 퍼블리싱 개선)",
        "**Lighthouse 성능 개선 작업**을 통한 모바일 및 데스크톱 진입 초기 지표 최적화",
      ],
      skills: ["html", "css", "js", "react", "next", "typescript", "git", "github", "jira", "confluence", "figma", "vscode", "web standards", "web accessibility", "lighthouse", "performance optimization"],
    },
    {
      company: "(주)키스템프그룹",
      role: "웹퍼블리셔",
      period: "2016.02 - 2016.07",
      description: "**잡코리아, 알바몬, 게임잡** 서비스의 웹 표준화 및 웹 접근성 인증 대응.",
      achievements: [
        "**웹 접근성 인증마크 획득**을 위한 마크업 구조 개선 및 접근성 표준 대응",
        "레거시 코드 구조 개선, 점진적 유지보수 및 **웹/모바일 리뉴얼 퍼블리싱 참여**",
        "**재사용 가능한 공통 UI 마크업 컴포넌트 제작** 및 **크로스 브라우징 대응**",
      ],
      skills: ["html", "css", "js", "react", "next", "typescript", "git", "github", "jira", "confluence", "figma", "vscode", "web standards", "web accessibility", "lighthouse", "performance optimization"],
    },
    {
      company: "혜안",
      role: "웹퍼블리셔",
      period: "2015.09 - 2016.01",
      description: "**국민안전처** 대국민 서비스 웹 퍼블리싱 대응.",
      achievements: [
        "**웹 접근성 인증마크 획득 대응** 및 **웹 표준 마크업 표준화**",
        "웹 표준 기반 **시맨틱 마크업 작업 수행**",
      ],
      skills: ["html", "css", "js", "react", "next", "typescript", "git", "github", "jira", "confluence", "figma", "vscode", "web standards", "web accessibility", "lighthouse", "performance optimization"],
    },
    {
      company: "(주)에이매스컨설팅",
      role: "이지웰복지관 프로젝트 웹퍼블리셔",
      period: "2015.07 - 2015.08",
      description: "**이지웰복지관** 웹 서비스 표준화 및 퍼블리싱 가이드라인 수립.",
      achievements: [
        "**웹 표준화 및 접근성 고도화** 개발 작업 수행",
        "**웹 접근성 인증마크 획득 대응** 및 **공통 UI 마크업 컴포넌트 제작**",
        "**퍼블리싱 구조 표준화** 및 템플릿 배포",
      ],
      skills: ["html", "css", "js", "react", "next", "typescript", "git", "github", "jira", "confluence", "figma", "vscode", "web standards", "web accessibility", "lighthouse", "performance optimization"],
    },
    {
      company: "주식회사 센트비젼",
      role: "Dongik9 / WithUsIMC / SHAREBLING 웹퍼블리셔",
      period: "2014.10 - 2015.04",
      description: "모바일 앱 및 웹 플랫폼의 **반응형 UI 퍼블리싱 구현**.",
      achievements: [
        "**모바일 앱 UI 퍼블리싱**, 화면 구현 및 **모바일 브라우저 최적화 수행**",
        "**반응형 웹사이트 퍼블리싱** 및 레거시 마크업 개선",
        "**재사용 가능한 공통 UI 마크업 구조 설계** 및 유지보수",
      ],
      skills: ["html", "css", "js", "react", "next", "typescript", "git", "github", "jira", "confluence", "figma", "vscode", "web standards", "web accessibility", "lighthouse", "performance optimization"],
    },
    {
      company: "홍콩 현지 기업 (홍콩정부 e-book)",
      role: "웹퍼블리셔 (해외경험)",
      period: "2013.02 - 2014.02",
      description: "**홍콩정부 e-book** 프로젝트 및 **KEYPAD 엔터테인먼트 잡지** 서비스 퍼블리싱 설계.",
      achievements: [
        "**홍콩정부 e-book 프로젝트** 멀티디바이스 마크업 및 최적화 진행",
        "**KEYPAD 엔터테인먼트 잡지 사이트** 및 해외 서비스 퍼블리싱 다수 리드",
      ],
      skills: ["html", "css", "js", "react", "next", "typescript", "git", "github", "jira", "confluence", "figma", "vscode", "web standards", "web accessibility", "lighthouse", "performance optimization"],
    },
    {
      company: "톰앤래빗",
      role: "SHAREBLING Version1 웹퍼블리셔",
      period: "2014.05 - 2014.10",
      description: "쇼핑몰 및 서비스 **UI 퍼블리싱 대응**.",
      achievements: [
        "서비스 UI 퍼블리싱, **크로스 브라우징 및 반응형 대응**",
        "**재사용 가능한 UI 구조 개발** 및 마크업 최적화",
      ],
      skills: ["html", "css", "js", "react", "next", "typescript", "git", "github", "jira", "confluence", "figma", "vscode", "web standards", "web accessibility", "lighthouse", "performance optimization"],
    },
    {
      company: "(주)넷트루컨설팅그룹",
      role: "하나은행 프로젝트 웹퍼블리셔",
      period: "2011.01 - 2012.10",
      description: "**하나은행** 및 계열사 대고객 **웹 표준/웹 접근성(WA) 개편 사업 수행**.",
      achievements: [
        "**웹 표준 및 접근성 개선 가이드라인 수립** 및 마크업 대응",
        "**웹 접근성 인증마크 획득 대응** 및 계열사 사이트 리뉴얼",
        "**반응형 및 크로스 브라우징 마크업 설계**",
      ],
      skills: ["html", "css", "js", "react", "next", "typescript", "git", "github", "jira", "confluence", "figma", "vscode", "web standards", "web accessibility", "lighthouse", "performance optimization"],
    },
  ],
  projects: [
    {
      id: "toss-alba",
      title: "Toss Open API 연동 프로젝트",
      subtitle: "외부 토스 파트너십 서비스 연동을 위한 Open API 구축",
      role: "서버리스 API 개발자",
      period: {
        start: "2025.11",
        end: "2025.12",
      },
      techStack: [
        { category: "backend", name: "Node.js" },
        { category: "backend", name: "AWS Lambda" },
        { category: "backend", name: "API Gateway" },
      ],
      summary: "외부 파트너사인 **토스와의 데이터 연동**을 위한 **Open API 서버리스 인프라 구축** 프로젝트입니다. 내부 데이터를 외부 스펙에 맞게 가공·전달하는 API 구조를 설계하고 인증 및 예외 처리 체계를 구축했습니다.",
      troubleshooting: [
        {
          problem: "서버리스 환경에서 토스 인증 규격(Bearer Token) 및 스펙 검증 결핍 우려.",
          solution: "AWS API Gateway에 커스텀 Authorizer 및 Bearer Token 인증 검증 핸들러를 Lambda Stateless 구조로 구현.",
          impact: "서버리스 구조 도입으로 트래픽 무제한 확장성 확보 및 응답 일관성 유지.",
        },
      ],
      metrics: [
        { label: "운영 비용 절감", value: "서버리스 최적화" },
        { label: "인증 안정성", value: "100% 검증" },
      ],
    },
    {
      id: "ai-chat",
      title: "실시간 채팅 및 AI 챗봇 서비스 개발",
      subtitle: "구직자-기업 연결 실시간 WebSocket 및 AI 채팅 채널 개발",
      role: "프론트엔드 리드 개발자",
      period: {
        start: "2025.06",
        end: "2025.10",
      },
      techStack: [
        { category: "frontend", name: "Next.js" },
        { category: "frontend", name: "TypeScript" },
        { category: "frontend", name: "Zustand" },
        { category: "frontend", name: "TanStack Query" },
        { category: "frontend", name: "vanilla-extract" },
      ],
      summary: "채용 플랫폼 내 구직자와 기업 사용자를 연결하는 **실시간 채팅 및 AI 챗봇 서비스**를 개발했습니다. 실시간 메시징 환경에서 **안정적인 상태 동기화**와 **장애 복원 UX**를 구현하는 데 집중했습니다.",
      troubleshooting: [
        {
          problem: "모바일 슬립 상태 및 단절 상황에서 WebSocket 연결 단절 후 메시지 누락 및 상태 불일치 발생.",
          solution: "STOMP 기반 실시간 채널 구독 구조에 지수 백오프(Exponential Backoff)를 포함한 자동 재연결 알고리즘과 낙관적 업데이트(Optimistic Update) 적용.",
          impact: "네트워크 단절 복구 안정성 100% 확보 및 체감 메시지 전송 속도 향상.",
        },
        {
          problem: "AI 챗봇 메시지의 Markdown 렌더링 처리 시 발생할 수 있는 보안 취약점 노출 위험.",
          solution: "DOMPurify 라이브러리를 도입하여 XSS 방어를 완벽히 적용하고 iOS Safari의 렌더링 버그에 대응하기 위한 스타일 개선 수행.",
          impact: "보안 취약점 제로 및 크로스 브라우징(특히 Safari 모바일) 안정성 강화.",
        },
      ],
      metrics: [
        { label: "자동 복원 성공률", value: "100%" },
        { label: "체감 전송 속도", value: "낙관적 업데이트 반영" },
      ],
    },
  ],
  skills: [
    {
      title: "핵심 기술 역량",
      skills: [
        "Next.js (App Router)",
        "React",
        "TypeScript",
        "vanilla-extract",
        "Zustand",
        "TanStack Query",
        "WebSocket (STOMP)",
      ],
    },
    {
      title: "백엔드 및 클라우드",
      skills: [
        "Node.js",
        "AWS API Gateway",
        "AWS Lambda (Serverless)",
        "REST API Design",
        "Bearer Token Auth",
      ],
    },
    {
      title: "마크업 및 웹 표준",
      skills: [
        "시맨틱 HTML / CSS",
        "웹 접근성 (접근성 인증마크 획득)",
        "반응형 웹 설계",
        "크로스 브라우징 대응",
      ],
    },
  ],
};

export const PORTFOLIO_DATA_EN: PortfolioData = {
  profile: {
    name: "James Kim",
    role: "Frontend Developer",
    tagline: "I build accessible, pixel-perfect experiences for the web.",
    aboutMe: "I’m a frontend engineer with a deep passion for building **accessible, pixel-perfect user interfaces** that bridge the gap between design and scalable engineering. I take pride in crafting clean, semantic code and have a sharp eye for the small, critical details that elevate user experience.\n\nPreviously, I was at **Worksphere**, where I designed and built robust platform structures, such as dynamic menu engines and fine-grained navigation controls. I also actively drove frontend architecture, leading the **layout publishing for major service renewals at JobKorea**, and constructed highly reliable, offline-resilient **WebSocket architecture for real-time AI chatting**.\n\nOver the years, I’ve worked across diverse environments — partnering with startups, outsourcing agencies, and major platforms like **Toss Albar**, **Kistemp**, and **Netrue**. These experiences have shaped my expertise in web accessibility standards, cross-browser compatibility, and modular frontend architectures.\n\nIn my spare time, you can usually find me researching new web standards, looking through design concepts, or enjoying my time offline recharging for the next build.",
    github: "https://github.com/cooolpower",
    email: "developerjameskim@gmail.com",
  },
  careers: [
    {
      company: "Worksphere LLC",
      role: "FE Platform Team Engineer",
      period: "2024.05 - 2026.01",
      description: "Led platform-level contributions, real-time AI chatting, and external partner API integrations.",
      achievements: [
        "Designed and developed common header components to standardize team-wide collaborative component libraries",
        "Architected admin-based menu management engines and dynamic rendering systems",
        "Implemented global navigation state management and fine-grained Role-Based Access Control (RBAC)",
        "Refactored legacy code structure and optimized rendering performance",
        "Participated in the large-scale service renewal for JobKorea (Main, Search, Resume, Postings, and Login UI/Markup)",
        "Contributed to Lighthouse performance tuning to optimize initial mobile and desktop load speed metrics",
      ],
      skills: ["html", "css", "js", "react", "next", "typescript", "git", "github", "jira", "confluence", "figma", "vscode", "web standards", "web accessibility", "lighthouse", "performance optimization"],
    },
    {
      company: "Kistemp Group Co., Ltd.",
      role: "Web Publisher (JobKorea / Albamon / Gamejob)",
      period: "2016.02 - 2016.07",
      description: "Dedicated to Web Standardization and Accessibility Certificate compliance.",
      achievements: [
        "Refactored markup architecture to secure Web Accessibility (WA) certificate marks",
        "Maintained legacy code and took part in web/mobile major service layout renewals",
        "Created reusable common UI markup structures and ensured cross-browser compatibility",
      ],
      skills: ["html", "css", "js", "react", "next", "typescript", "git", "github", "jira", "confluence", "figma", "vscode", "web standards", "web accessibility", "lighthouse", "performance optimization"],
    },
    {
      company: "Hyean",
      role: "Web Publisher (Ministry of Public Safety and Security)",
      period: "2015.09 - 2016.01",
      description: "Performed web publishing for public service portals.",
      achievements: [
        "Completed markup layouts aligning with Web Accessibility guidelines and standardized code templates",
        "Executed semantic markup workflows based on strict W3C web standards",
      ],
      skills: ["html", "css", "js", "react", "next", "typescript", "git", "github", "jira", "confluence", "figma", "vscode", "web standards", "web accessibility", "lighthouse", "performance optimization"],
    },
    {
      company: "A-Mass Consulting",
      role: "Web Publisher (Ezwel Welfare Center)",
      period: "2015.07 - 2015.08",
      description: "Established web standardization and publishing guidelines.",
      achievements: [
        "Performed web standardization and accessibility enhancement operations",
        "Assisted in getting Web Accessibility certificate marks and crafted common UI component templates",
        "Standardized overall publishing structures and stylesheet templates",
      ],
      skills: ["html", "css", "js", "react", "next", "typescript", "git", "github", "jira", "confluence", "figma", "vscode", "web standards", "web accessibility", "lighthouse", "performance optimization"],
    },
    {
      company: "Centvision Co., Ltd.",
      role: "Web Publisher (Dongik9 / WithUsIMC / SHAREBLING)",
      period: "2014.10 - 2015.04",
      description: "Implemented responsive UI layouts for mobile app and web platforms.",
      achievements: [
        "Developed mobile app UI structures and applied mobile browser optimizations",
        "Built responsive websites and revised legacy markup codebases",
        "Managed reusable common UI markup configurations and layout styles",
      ],
      skills: ["html", "css", "js", "react", "next", "typescript", "git", "github", "jira", "confluence", "figma", "vscode", "web standards", "web accessibility", "lighthouse", "performance optimization"],
    },
    {
      company: "Hong Kong local firm (Hong Kong Government e-book)",
      role: "Web Publisher (Overseas Experience)",
      period: "2013.02 - 2014.02",
      description: "Collaborated on the Hong Kong Government e-book project and KEYPAD magazine site layouts.",
      achievements: [
        "Managed multi-device markup and performance optimization for the Hong Kong government e-book portal",
        "Led front-facing markup layouts for KEYPAD entertainment magazine and multiple overseas web interfaces",
      ],
      skills: ["html", "css", "js", "react", "next", "typescript", "git", "github", "jira", "confluence", "figma", "vscode", "web standards", "web accessibility", "lighthouse", "performance optimization"],
    },
    {
      company: "Tom & Rabbit",
      role: "SHAREBLING Version1 Web Publisher",
      period: "2014.05 - 2014.10",
      description: "Handled e-commerce and portal UI publishing.",
      achievements: [
        "Developed service UI structures while managing cross-browsing and responsive constraints",
        "Designed reusable UI architectures and optimized layout components",
      ],
      skills: ["html", "css", "js", "react", "next", "typescript", "git", "github", "jira", "confluence", "figma", "vscode", "web standards", "web accessibility", "lighthouse", "performance optimization"],
    },
    {
      company: "Netrue Consulting Group",
      role: "Web Publisher (Hana Bank)",
      period: "2011.01 - 2012.10",
      description: "Executed web standardization and Web Accessibility (WA) renewals for Hana Bank and affiliates.",
      achievements: [
        "Formulated web standard and accessibility guidelines and executed markup layouts",
        "Successfully secured Web Accessibility certificates and led bank affiliate renewals",
        "Designed responsive and cross-browser compatible layouts",
      ],
      skills: ["html", "css", "js", "react", "next", "typescript", "git", "github", "jira", "confluence", "figma", "vscode", "web standards", "web accessibility", "lighthouse", "performance optimization"],
    },
  ],
  projects: [
    {
      id: "toss-alba",
      title: "Toss Open API Integration",
      subtitle: "Constructed Open API serverless infrastructure for Toss partnership data syncing",
      role: "Serverless API Developer",
      period: {
        start: "2025.11",
        end: "2025.12",
      },
      techStack: [
        { category: "backend", name: "Node.js" },
        { category: "backend", name: "AWS Lambda" },
        { category: "backend", name: "API Gateway" },
      ],
      summary: "A serverless infrastructure building project for Toss data sharing. Modeled and transformed internal database records to fit partner specifications while establishing validation and authorization handlers.",
      troubleshooting: [
        {
          problem: "Concerns regarding Bearer Token validation and structural verification in a stateless environment.",
          solution: "Constructed custom API Gateway Authorizers and token decryption handlers integrated with stateless AWS Lambda configurations.",
          impact: "Succeeded in getting infinite scalability and maintaining 100% stable API response rates.",
        },
      ],
      metrics: [
        { label: "Operation Overhead", value: "Serverless Optimized" },
        { label: "Auth Validation Rate", value: "100% Secured" },
      ],
    },
    {
      id: "ai-chat",
      title: "Real-time AI Chatbot Service",
      subtitle: "Designed real-time WebSocket messaging and AI channels for recruiters and job seekers",
      role: "Frontend Lead",
      period: {
        start: "2025.06",
        end: "2025.10",
      },
      techStack: [
        { category: "frontend", name: "Next.js" },
        { category: "frontend", name: "TypeScript" },
        { category: "frontend", name: "Zustand" },
        { category: "frontend", name: "TanStack Query" },
        { category: "frontend", name: "vanilla-extract" },
      ],
      summary: "Developed live messaging interfaces with custom AI chatbots. Focused heavily on designing offline-resilient socket connections and seamless user state syncing.",
      troubleshooting: [
        {
          problem: "Mobile sleep states and cellular toggling caused socket disconnection, missing packets, and local/remote state mismatches.",
          solution: "Established a STOMP subscription model backed by automatic exponential backoff reconnection algorithms and UI optimistic updates.",
          impact: "Secured 100% automatic recovery rates and significantly boosted perceived messaging speeds.",
        },
        {
          problem: "XSS vulnerability threat when rendering AI markdown formatted text bubbles.",
          solution: "Integrated DOMPurify for absolute layout sanitation and addressed layout rendering bugs on iOS mobile Safari.",
          impact: "Achieved zero vulnerabilities and enhanced cross-browser UI safety.",
        },
      ],
      metrics: [
        { label: "Auto-reconnect Success", value: "100%" },
        { label: "Messaging Latency UI", value: "Optimistic" },
      ],
    },
  ],
  skills: [
    {
      title: "Core Technologies",
      skills: [
        "Next.js (App Router)",
        "React",
        "TypeScript",
        "vanilla-extract",
        "Zustand",
        "TanStack Query",
        "WebSocket (STOMP)",
      ],
    },
    {
      title: "Backend & Cloud",
      skills: [
        "Node.js",
        "AWS API Gateway",
        "AWS Lambda (Serverless)",
        "REST API Design",
        "Bearer Token Auth",
      ],
    },
    {
      title: "Markup & Accessibility",
      skills: [
        "Semantic HTML / CSS",
        "Web Accessibility (WA Certified)",
        "Responsive Web Layouts",
        "Cross-Browser Compatibility",
      ],
    },
  ],
};

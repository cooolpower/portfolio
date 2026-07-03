import { ArrowLeft, Github, ExternalLink, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/components/ui/LanguageContext";
import { PORTFOLIO_DATA_KO, PORTFOLIO_DATA_EN } from "@/constants/data";
import { parseHighlight } from "@/utils/parse-highlight";
import * as styles from "./archive-page.css";

export function ArchivePage() {
  const { language, translate } = useLanguage();
  const data = language === "ko" ? PORTFOLIO_DATA_KO : PORTFOLIO_DATA_EN;

  // 1. careers의 achievements에서 대괄호 [프로젝트명] 정보를 파싱하여 가상 프로젝트 리스트 생성
  const virtualProjects = data.careers.flatMap((career) => {
    const yearMatch = career.period.match(/^(\d{4})/);
    const year = yearMatch ? yearMatch[1] : "";
    const items: any[] = [];

    career.achievements.forEach((ach) => {
      const match = ach.match(/^\[(.*?)\]\s*(.*)$/);
      if (match) {
        const projName = match[1].trim();
        const details = match[2].trim(); // ** 별표 제거 로직 삭제하여 마크다운 보존

        const existing = items.find((item) => item.title === projName);
        if (existing) {
          // 이미 추가된 프로젝트명이면 설명 문구 결합
          existing.subtitle = `${existing.subtitle}, ${details}`;
        } else {
          // groupLinks 매핑 검사
          let demoUrl = career.link;
          if (career.groupLinks) {
            const matchedKey = Object.keys(career.groupLinks).find(
              (k) => k.includes(projName) || projName.includes(k),
            );
            if (matchedKey) {
              demoUrl = career.groupLinks[matchedKey];
            }
          }

          // 프로젝트별 관련 스택 필터링
          let filteredSkills = [...career.skills];
          const lowerProjName = projName.toLowerCase();
          if (
            lowerProjName.includes("헤더") ||
            lowerProjName.includes("header")
          ) {
            filteredSkills = filteredSkills.filter(
              (s) =>
                ![
                  "websocket",
                  "stomp",
                  "aws lambda",
                  "api gateway",
                  "aws sdk",
                  "axios",
                ].includes(s.toLowerCase()),
            );
          } else if (
            lowerProjName.includes("토스") ||
            lowerProjName.includes("toss")
          ) {
            filteredSkills = filteredSkills.filter(
              (s) =>
                !["websocket", "stomp", "vanilla-extract", "zustand"].includes(
                  s.toLowerCase(),
                ),
            );
          }

          // 스킬 명칭 및 카테고리 매핑 헬퍼
          const skillMap: Record<string, string> = {
            html: "HTML5 / CSS3",
            css: "HTML5 / CSS3",
            js: "Vanilla JS",
            javascript: "Vanilla JS",
            jquery: "jQuery",
            "web standards": "웹 표준 & 웹 접근성",
            "web accessibility": "웹 표준 & 웹 접근성",
            "vanilla js": "Vanilla JS",
            sass: "Sass",
            scss: "Sass",
            "cross browsing": "크로스 브라우징",
            photoshop: "Photoshop",
            illustrator: "Illustrator",
            indesign: "InDesign",
            editplus: "EditPlus",
            flash: "Flash",
            trello: "Trello",
            svn: "SVN",
            git: "Git",
            github: "GitHub",
            gitlab: "GitLab",
            bitbucket: "Bitbucket",
            react: "React",
            next: "Next.js",
            typescript: "TypeScript",
            "vanilla-extract": "Vanilla Extract",
            zustand: "Zustand",
            "aws lambda": "AWS Lambda",
            "api gateway": "API Gateway",
            "ion-cms": "I-ON (CMS)",
          };

          const getCategory = (
            name: string,
          ): "frontend" | "backend" | "devops" | "testing" | "ide" => {
            const lower = name.toLowerCase();
            if (
              [
                "html5 / css3",
                "vanilla js",
                "jquery",
                "웹 표준 & 웹 접근성",
                "sass",
                "크로스 브라우징",
                "react",
                "next.js",
                "typescript",
                "vanilla extract",
                "zustand",
                "html / css",
                "ui퍼블리싱 및 모션",
              ].includes(lower) ||
              lower.includes("standards") ||
              lower.includes("accessibility") ||
              lower.includes("browsing") ||
              lower.includes("css") ||
              lower.includes("js")
            ) {
              return "frontend";
            }
            if (
              [
                "aws lambda",
                "api gateway",
                "node.js",
                "i-on (cms)",
                "aws sdk",
                "axios",
              ].includes(lower) ||
              lower.includes("lambda") ||
              lower.includes("gateway")
            ) {
              return "backend";
            }
            if (
              ["svn", "git", "github", "gitlab", "bitbucket"].includes(lower)
            ) {
              return "devops";
            }
            if (
              [
                "photoshop",
                "illustrator",
                "indesign",
                "editplus",
                "trello",
                "flash",
                "cursor",
                "slack",
                "jira",
                "confluence",
                "figma",
                "photoshop cs6",
                "illustrator cs6",
                "indesign cs6",
                "photoshop cs5",
                "illustrator cs5",
                "photoshop cs2",
              ].includes(lower)
            ) {
              return "ide";
            }
            return "testing";
          };

          const mappedSkills = Array.from(
            new Set(filteredSkills.map((s) => skillMap[s.toLowerCase()] || s)),
          ).map((name) => ({
            name,
            category: getCategory(name),
          }));

          items.push({
            id: `virtual-${career.company}-${projName}`
              .toLowerCase()
              .replace(/\s+/g, "-"),
            title: projName,
            subtitle: details,
            year,
            madeAt: career.company,
            techStack: mappedSkills,
            links: demoUrl ? { demo: demoUrl } : undefined,
          });
        }
      }
    });
    return items;
  });

  // 2. 수동 정의된 세부 프로젝트와 가상 프로젝트 병합 (중복 제거)
  const mergedProjects = [...data.projects];

  virtualProjects.forEach((vProj) => {
    // 기존 수동 등록 프로젝트(toss-alba 등)와 타이틀/아이디가 겹치지 않는 경우만 추가
    const isDuplicate = mergedProjects.some((p) => {
      const normalizedVProjTitle = vProj.title
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]/g, "");
      const normalizedPId = p.id.toLowerCase().replace(/[^a-zA-Z0-9]/g, "");

      const isTossMatch =
        (vProj.title.includes("토스") ||
          vProj.title.toLowerCase().includes("toss")) &&
        (p.title.includes("토스") ||
          p.title.toLowerCase().includes("toss") ||
          p.id.includes("toss"));

      const isChatMatch =
        (vProj.title.includes("AI 채팅") || vProj.title.includes("chat")) &&
        (p.title.includes("AI 채팅") ||
          p.title.toLowerCase().includes("chat") ||
          p.id.includes("chat"));

      return (
        normalizedVProjTitle.includes(normalizedPId) ||
        normalizedPId.includes(normalizedVProjTitle) ||
        p.title.includes(vProj.title) ||
        vProj.title.includes(p.title) ||
        isTossMatch ||
        isChatMatch
      );
    });
    if (!isDuplicate) {
      mergedProjects.push(vProj);
    }
  });

  // 3. 연도 기준 내림차순(최신순) 정렬
  const sortedProjects = [...mergedProjects].sort(
    (a, b) => parseInt(b.year) - parseInt(a.year),
  );

  const handleBackClick = () => {
    window.history.pushState({}, "", "/");
    window.dispatchEvent(new Event("pushstate-navigate"));
  };

  return (
    <div className={styles.archiveWrapper}>
      <div className={styles.archiveContainer}>
        {/* Back Link */}
        <button
          type="button"
          onClick={handleBackClick}
          className={styles.backLink}
        >
          <ArrowLeft size={16} />
          {translate("backToHome")}
        </button>

        {/* Title */}
        <h1 className={styles.archiveTitle}>{translate("archiveTitle")}</h1>
        <p className={styles.archiveSubtitle}>{translate("archiveSubtitle")}</p>

        {/* Table */}
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.thYear}>{translate("tableYear")}</th>
                <th className={styles.thTitle}>{translate("tableProject")}</th>
                <th className={styles.thMadeAt}>{translate("tableMadeAt")}</th>
                <th className={styles.thBuiltWith}>
                  {translate("tableBuiltWith")}
                </th>
                <th className={styles.thLink}>{translate("tableLink")}</th>
              </tr>
            </thead>
            <tbody>
              {sortedProjects.map((proj) => (
                <tr key={proj.id} className={styles.tr}>
                  <td className={styles.tdYear}>{proj.year}</td>
                  <td className={styles.tdTitle}>
                    <div className={styles.projContainer}>
                      <span className={styles.projTitleText}>{proj.title}</span>
                      {proj.subtitle && (
                        <span className={styles.projSubtitleText}>
                          {" "}
                          {parseHighlight(proj.subtitle)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className={styles.tdMadeAt}>
                    {proj.madeAt ? proj.madeAt : "—"}
                  </td>
                  <td className={styles.tdBuiltWith}>
                    <div className={styles.badgeList}>
                      {proj.techStack.map((tech: any) => (
                        <Badge key={tech.name} category={tech.category}>
                          {tech.name}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className={styles.tdLink}>
                    <div className={styles.linkList}>
                      {proj.links?.github && (
                        <a
                          href={proj.links.github}
                          target="_blank"
                          rel="noreferrer"
                          className={styles.iconLink}
                          aria-label="GitHub Link"
                        >
                          <Github size={16} />
                        </a>
                      )}
                      {proj.links?.demo && (
                        <a
                          href={proj.links.demo}
                          target="_blank"
                          rel="noreferrer"
                          className={styles.iconLink}
                          aria-label="Demo Link"
                        >
                          <ExternalLink size={16} />
                        </a>
                      )}
                      {proj.links?.document && (
                        <a
                          href={proj.links.document}
                          target="_blank"
                          rel="noreferrer"
                          className={styles.iconLink}
                          aria-label="Document Link"
                        >
                          <FileText size={16} />
                        </a>
                      )}
                      {!proj.links && "—"}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

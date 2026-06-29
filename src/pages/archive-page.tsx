import { ArrowLeft, Github, ExternalLink, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/components/ui/LanguageContext";
import { PORTFOLIO_DATA_KO, PORTFOLIO_DATA_EN } from "@/constants/data";
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
        const details = match[2].trim().replace(/\*\*/g, ""); // 마크다운 볼드 제거

        const existing = items.find((item) => item.title === projName);
        if (existing) {
          // 이미 추가된 프로젝트명이면 설명 문구 결합
          existing.subtitle = `${existing.subtitle}, ${details}`;
        } else {
          // groupLinks 매핑 검사
          let demoUrl = career.link;
          if (career.groupLinks) {
            const matchedKey = Object.keys(career.groupLinks).find(
              (k) => k.includes(projName) || projName.includes(k)
            );
            if (matchedKey) {
              demoUrl = career.groupLinks[matchedKey];
            }
          }

          items.push({
            id: `virtual-${career.company}-${projName}`.toLowerCase().replace(/\s+/g, "-"),
            title: projName,
            subtitle: details,
            year,
            madeAt: career.company,
            techStack: career.skills.map((skill) => ({ name: skill })),
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
    const isDuplicate = mergedProjects.some(
      (p) =>
        p.id.includes(vProj.title.toLowerCase().replace(/\s+/g, "-")) ||
        vProj.title.toLowerCase().includes(p.id) ||
        p.title.includes(vProj.title) ||
        vProj.title.includes(p.title)
    );
    if (!isDuplicate) {
      mergedProjects.push(vProj);
    }
  });

  // 3. 연도 기준 내림차순(최신순) 정렬
  const sortedProjects = [...mergedProjects].sort(
    (a, b) => parseInt(b.year) - parseInt(a.year)
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
                    <span className={styles.projTitleText}>{proj.title}</span>
                    {proj.subtitle && (
                      <span className={styles.projSubtitleText}>
                        {" "}
                        — {proj.subtitle}
                      </span>
                    )}
                  </td>
                  <td className={styles.tdMadeAt}>
                    {proj.madeAt ? proj.madeAt : "—"}
                  </td>
                  <td className={styles.tdBuiltWith}>
                    <div className={styles.badgeList}>
                      {proj.techStack.map((tech: any) => (
                        <Badge key={tech.name}>{tech.name}</Badge>
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

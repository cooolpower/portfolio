import { useEffect } from "react";
import {
  X,
  Github,
  ExternalLink,
  FileText,
  AlertTriangle,
  Wrench,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/components/ui/LanguageContext";
import type { Project } from "@/constants/data";
import { parseHighlight } from "@/utils/parse-highlight";
import * as styles from "./project-detail-modal.css";

interface ProjectDetailModalProps {
  project: Project;
  onClose: () => void;
}

const TECH_WORDS = [
  "Exponential Backoff",
  "Optimistic Update",
  "AWS API Gateway",
  "AWS Lambda",
  "API Gateway",
  "Lambda",
  "Stateless",
  "Bearer Token",
  "DOMPurify",
  "WebSocket",
  "STOMP",
  "Safari",
  "jQuery",
  "Lighthouse",
  "Node.js",
];

// 기술 키워드를 code 칩으로 렌더링하는 헬퍼
function parseTechWords(text: string): React.ReactNode[] {
  const sortedWords = [...TECH_WORDS].sort((a, b) => b.length - a.length);
  const regex = new RegExp(
    `(${sortedWords.map((w) => w.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")).join("|")})`,
    "g",
  );

  const parts = text.split(regex);
  return parts.map((part, index) => {
    if (index % 2 === 1) {
      return (
        <code
          key={index}
          className={styles.inlineCode}
          aria-label={`기술 용어: ${part}`}
        >
          {part}
        </code>
      );
    }
    return part;
  });
}

// 굵은 글씨(**)와 기술 키워드 및 수치(%)를 함께 파싱하는 통합 헬퍼
function parseRichText(
  text: string,
  isImpact: boolean = false,
): React.ReactNode {
  const boldParts = text.split(/\*\*([^*]+)\*\*/g);

  const result = boldParts.flatMap((part, index) => {
    if (index % 2 === 1) {
      return (
        <strong key={`bold-${index}`} className={styles.boldHighlight}>
          {part}
        </strong>
      );
    }

    let parsed: React.ReactNode[] = parseTechWords(part);

    if (isImpact) {
      parsed = parsed.flatMap((node, nodeIdx) => {
        if (typeof node === "string") {
          const numParts = node.split(/(\d+(?:\.\d+)?%)/g);
          return numParts.map((numPart, numIdx) => {
            if (numIdx % 2 === 1) {
              return (
                <span
                  key={`num-${nodeIdx}-${numIdx}`}
                  className={styles.impactNumber}
                >
                  {numPart}
                </span>
              );
            }
            return numPart;
          });
        }
        return node;
      });
    }

    return parsed;
  });

  return <>{result}</>;
}

export function ProjectDetailModal({
  project,
  onClose,
}: ProjectDetailModalProps) {
  const { translate } = useLanguage();

  // Handle Esc key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    // Prevent background scrolling
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [onClose]);

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div>
            <span className={styles.modalPeriod}>
              {project.period.start} - {project.period.end}
            </span>
            <h2 className={styles.modalTitle}>{project.title}</h2>
            <p className={styles.modalSubtitle}>
              {project.subtitle} | {project.role}
            </p>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label={translate("closeModal")}
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className={styles.modalBody}>
          {/* Summary */}
          <div className={styles.imageGallery}>
            {project.image.map((image, index) => (
              <img
                key={index}
                src={image.src}
                alt={`Project image ${index + 1}`}
                className={styles.galleryImage}
                width={image.width}
                height={image.height}
              />
            ))}
          </div>
          <div className={styles.sectionBlock}>
            <p className={styles.summaryText}>
              {parseHighlight(project.summary)}
            </p>
          </div>

          {/* Links */}
          {project.links && (
            <div className={styles.sectionBlock}>
              <div className={styles.linksRow}>
                {project.links.github && (
                  <a
                    href={project.links.github}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.linkButton}
                  >
                    <Github size={16} />
                    GitHub
                  </a>
                )}
                {project.links.demo && (
                  <a
                    href={project.links.demo}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.linkButton}
                  >
                    <ExternalLink size={16} />
                    Demo
                  </a>
                )}
                {project.links.document && (
                  <a
                    href={project.links.document}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.linkButton}
                  >
                    <FileText size={16} />
                    Document
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Tech Stack Badge List */}
          <div className={styles.sectionBlock}>
            <div className={styles.techStackList}>
              {project.techStack.map((tech) => (
                <Badge key={tech.name}>{tech.name}</Badge>
              ))}
            </div>
          </div>

          {/* Metrics */}
          {project.metrics && project.metrics.length > 0 && (
            <div className={styles.sectionBlock}>
              <h3 className={styles.subBlockTitle}>
                {translate("metricsTitle")}
              </h3>
              <div className={styles.metricsGrid}>
                {project.metrics.map((metric) => (
                  <div key={metric.label} className={styles.metricCard}>
                    <span className={styles.metricVal}>{metric.value}</span>
                    <span className={styles.metricLabel}>{metric.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Troubleshooting */}
          {project.troubleshooting && project.troubleshooting.length > 0 && (
            <div className={styles.sectionBlock}>
              <h3 className={styles.subBlockTitle}>{translate("tsTitle")}</h3>
              <div className={styles.troubleContainer}>
                {project.troubleshooting.map((ts, idx) => (
                  <div key={idx} className={styles.troubleCard}>
                    {/* Problem */}
                    <div className={styles.troubleFieldProblem}>
                      <div className={styles.fieldHeader}>
                        <AlertTriangle
                          size={16}
                          className={styles.iconProblem}
                          aria-hidden="true"
                        />
                        <h4 className={styles.fieldLabel}>
                          {translate("tsProblem")}
                        </h4>
                      </div>
                      <p className={styles.fieldValue}>
                        {parseRichText(ts.problem)}
                      </p>
                    </div>

                    {/* Solution */}
                    <div className={styles.troubleFieldSolution}>
                      <div className={styles.fieldHeader}>
                        <Wrench
                          size={16}
                          className={styles.iconSolution}
                          aria-hidden="true"
                        />
                        <h4 className={styles.fieldLabel}>
                          {translate("tsSolution")}
                        </h4>
                      </div>
                      <p className={styles.fieldValue}>
                        {parseRichText(ts.solution)}
                      </p>
                    </div>

                    {/* Impact */}
                    <div className={styles.troubleFieldImpact}>
                      <div className={styles.fieldHeader}>
                        <TrendingUp
                          size={16}
                          className={styles.iconImpact}
                          aria-hidden="true"
                        />
                        <h4 className={styles.fieldLabel}>
                          {translate("tsImpact")}
                        </h4>
                      </div>
                      <p className={styles.fieldValue}>
                        {parseRichText(ts.impact, true)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

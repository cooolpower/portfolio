import { useEffect, useState, useRef } from "react";
import {
  X,
  Github,
  ExternalLink,
  FileText,
  AlertTriangle,
  Wrench,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
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
  const [currentSlide, setCurrentSlide] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    videoRefs.current = videoRefs.current.slice(0, project.image.length);
  }, [project.image]);

  useEffect(() => {
    videoRefs.current.forEach((video, idx) => {
      if (!video) return;
      if (idx === currentSlide) {
        video.play().catch(() => {});
      } else {
        video.pause();
        video.currentTime = 0;
      }
    });
  }, [currentSlide]);

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

  const renderTextContents = () => (
    <>
      <div className={styles.sectionBlock}>
        <p className={styles.summaryText}>{parseHighlight(project.summary)}</p>
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
          <h3 className={styles.subBlockTitle}>{translate("metricsTitle")}</h3>
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
                <div className={styles.troubleItem}>
                  <div className={styles.troubleTimeline}>
                    <div className={`${styles.timelineDot} problem`} />
                    <div className={styles.timelineLine} />
                  </div>
                  <div className={styles.troubleContent}>
                    <div className={styles.fieldHeader}>
                      <AlertTriangle
                        size={14}
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
                </div>

                {/* Solution */}
                <div className={styles.troubleItem}>
                  <div className={styles.troubleTimeline}>
                    <div className={`${styles.timelineDot} solution`} />
                    <div className={styles.timelineLine} />
                  </div>
                  <div className={styles.troubleContent}>
                    <div className={styles.fieldHeader}>
                      <Wrench
                        size={14}
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
                </div>

                {/* Impact */}
                <div className={styles.troubleItem}>
                  <div className={styles.troubleTimeline}>
                    <div className={`${styles.timelineDot} impact`} />
                  </div>
                  <div
                    className={styles.troubleContent}
                    style={{ paddingBottom: 0 }}
                  >
                    <div className={styles.fieldHeader}>
                      <TrendingUp
                        size={14}
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
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );

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
        <div
          className={`${styles.modalBody} ${
            project.layout === "portrait" ? styles.portraitBody : ""
          }`}
        >
          {/* Summary / Carousel Slider */}
          {project.image && project.image.length > 0 && (
            <div
              className={
                project.layout === "portrait"
                  ? styles.portraitContainer
                  : styles.carouselContainer
              }
            >
              <div className={styles.carouselViewport}>
                {project.image.map((image, index) => {
                  const isVideo = image.src.endsWith(".mp4");
                  return (
                    <div
                      key={index}
                      className={`${styles.carouselSlide} ${
                        index === currentSlide ? "active" : ""
                      }`}
                      style={{
                        display: index === currentSlide ? "flex" : "none",
                        width: "100%",
                        height: "100%",
                      }}
                    >
                      {isVideo ? (
                        <video
                          ref={(el) => {
                            videoRefs.current[index] = el;
                          }}
                          src={image.src}
                          className={styles.galleryVideo}
                          controls
                          muted
                          loop
                          playsInline
                        />
                      ) : (
                        <img
                          src={image.src}
                          alt={`${project.title} - ${index + 1}`}
                          className={
                            project.layout === "portrait"
                              ? styles.galleryImagePortrait
                              : styles.galleryImageLandscape
                          }
                          width={image.width}
                          height={image.height}
                        />
                      )}
                    </div>
                  );
                })}

                {/* Navigation Buttons */}
                {project.image.length > 1 && (
                  <>
                    <button
                      type="button"
                      className={styles.prevBtn}
                      onClick={() =>
                        setCurrentSlide((prev) =>
                          prev === 0 ? project.image.length - 1 : prev - 1,
                        )
                      }
                      aria-label="Previous slide"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      type="button"
                      className={styles.nextBtn}
                      onClick={() =>
                        setCurrentSlide((prev) =>
                          prev === project.image.length - 1 ? 0 : prev + 1,
                        )
                      }
                      aria-label="Next slide"
                    >
                      <ChevronRight size={24} />
                    </button>

                    {/* Counter Indicator */}
                    <div className={styles.carouselCounter}>
                      {currentSlide + 1} / {project.image.length}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Text Contents Block */}
          {project.layout === "portrait" ? (
            <div className={styles.portraitScrollBlock}>
              {renderTextContents()}
            </div>
          ) : (
            renderTextContents()
          )}
        </div>
      </div>
    </div>
  );
}

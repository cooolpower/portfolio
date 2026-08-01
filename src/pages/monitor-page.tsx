import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/components/ui/LanguageContext";
import { useTheme } from "@/components/ui/ThemeContext";
import { MicroserviceMonitor } from "@/components/monitor/MicroserviceMonitor";

export function MonitorPage() {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isLight = theme === "light";

  const handleBackClick = () => {
    window.history.pushState({}, "", "/");
    window.dispatchEvent(new Event("pushstate-navigate"));
  };

  const css = {
    root: {
      background: "transparent",
      color: isLight ? "#1e293b" : "#e2e8f0",
      fontFamily: "Inter, sans-serif",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "center",
      padding: "24px 16px 48px",
      gap: 0,
    },
    hdr: { width: "100%", marginBottom: 20 },
    hdrContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: 12,
      position: "relative" as const,
      width: "100%",
      maxWidth: 980,
      margin: "0 auto",
    },
    backBtn: {
      position: "absolute" as const,
      left: 0,
      display: "flex",
      alignItems: "center",
      gap: 6,
      background: "transparent",
      border: "none",
      color: isLight ? "#475569" : "#9ca3af",
      cursor: "pointer",
      fontFamily: "sans-serif",
      fontSize: 13,
      fontWeight: 500,
      padding: "8px 12px",
      borderRadius: "6px",
      transition: "color 0.2s, background-color 0.2s",
    },
    eyebrow: {
      fontFamily: "monospace",
      fontSize: 11,
      letterSpacing: ".2em",
      color: isLight ? "rgb(0 162 255)" : "#00d4ff",
      textTransform: "uppercase" as const,
      marginBottom: 6,
      textAlign: "center" as const,
    },
    h1: {
      fontSize: 28,
      fontWeight: 600,
      letterSpacing: "-.02em",
      color: isLight ? "#0f172a" : "#fff",
      textAlign: "center" as const,
    },
  };

  return (
    <div style={css.root}>
      {/* Header with Back Button */}
      <div style={css.hdr}>
        <div style={css.hdrContainer}>
          <button
            onClick={handleBackClick}
            style={css.backBtn}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = isLight ? "#0f172a" : "#fff";
              e.currentTarget.style.backgroundColor = isLight ? "#e2e8f0" : "#1e2d42";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = isLight ? "#475569" : "#9ca3af";
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <ArrowLeft size={16} />
            {language === "ko" ? "포트폴리오로 돌아가기" : "Back to Portfolio"}
          </button>
          <div>
            <div style={css.eyebrow}>websocket · real-time</div>
            <h1 style={css.h1}>
              Microservice{" "}
              <span style={{ color: isLight ? "rgb(0 162 255)" : "#00d4ff" }}>
                Live Monitor
              </span>
            </h1>
          </div>
        </div>
      </div>

      {/* Modular Monitor Component */}
      <MicroserviceMonitor />
    </div>
  );
}

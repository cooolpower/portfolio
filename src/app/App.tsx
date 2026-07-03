import { useState, useEffect } from "react";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { LanguageProvider } from "@/components/ui/LanguageContext";
import { AppLayout } from "@/layouts/app-layout";
import { PortfolioPage } from "@/pages/portfolio-page";
import { ArchivePage } from "@/pages/archive-page";
import { MonitorPage } from "@/pages/monitor-page";

export function App() {
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener("popstate", handlePopState);
    
    // Custom navigation event listener
    const handleNavigate = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener("pushstate-navigate", handleNavigate);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("pushstate-navigate", handleNavigate);
    };
  }, []);

  return (
    <ThemeProvider>
      <LanguageProvider>
        {currentPath === "/archive" ? (
          <AppLayout isFullWidth>
            <ArchivePage />
          </AppLayout>
        ) : currentPath === "/monitor" ? (
          <AppLayout isFullWidth>
            <MonitorPage />
          </AppLayout>
        ) : (
          <AppLayout>
            <PortfolioPage />
          </AppLayout>
        )}
      </LanguageProvider>
    </ThemeProvider>
  );
}




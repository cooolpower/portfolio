import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { LanguageProvider } from "@/components/ui/LanguageContext";
import { AppLayout } from "@/layouts/app-layout";
import { PortfolioPage } from "@/pages/portfolio-page";

export function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppLayout>
          <PortfolioPage />
        </AppLayout>
      </LanguageProvider>
    </ThemeProvider>
  );
}



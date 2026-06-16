import type { ReactNode } from "react";
import { Container } from "/components/layout/container";
import * as styles from "./app-layout.css";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className={styles.layout}>
      <main className={styles.main}>{children}</main>
      <footer className={styles.footer}>
        <Container>
          <p>
            © {new Date().getFullYear()} James. Built with React & Vanilla
            Extract.
          </p>
        </Container>
      </footer>
    </div>
  );
}

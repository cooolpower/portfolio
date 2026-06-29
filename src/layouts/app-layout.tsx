import { useEffect, type ReactNode } from "react";
import * as styles from "./app-layout.css";
import { LeftPanel } from "./left-panel";

interface AppLayoutProps {
  children: ReactNode;
  isFullWidth?: boolean;
}

export function AppLayout({ children, isFullWidth = false }: AppLayoutProps) {
  useEffect(() => {
    const el = document.documentElement;
    let targetX = 0;
    let targetY = 0;
    let curX = 0;
    let curY = 0;
    let animationFrameId: number | null = null;
    let isRunning = false;

    function animate() {
      const dx = targetX - curX;
      const dy = targetY - curY;

      // If coordinates are close enough, pause the loop to prevent idle CPU/GPU usage
      if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) {
        curX = targetX;
        curY = targetY;
        el.style.setProperty("--x", `${curX}px`);
        el.style.setProperty("--y", `${curY}px`);
        isRunning = false;
        animationFrameId = null;
        return;
      }

      curX += dx * 0.15;
      curY += dy * 0.15;
      el.style.setProperty("--x", `${curX}px`);
      el.style.setProperty("--y", `${curY}px`);
      
      animationFrameId = requestAnimationFrame(animate);
    }

    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      
      // Resume loop if it was paused
      if (!isRunning) {
        isRunning = true;
        if (!animationFrameId) {
          animationFrameId = requestAnimationFrame(animate);
        }
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <div className={isFullWidth ? styles.fullWidthLayout : styles.layout}>
      <div className={styles.spotlight} />
      
      {!isFullWidth && <LeftPanel />}

      {isFullWidth ? (
        <main className={styles.fullWidthContent}>{children}</main>
      ) : (
        <main className={styles.rightContent}>{children}</main>
      )}
    </div>
  );
}

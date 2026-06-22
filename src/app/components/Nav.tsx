import { useEffect, useRef, useState } from "react";
import ArrowOutwardRounded from "@mui/icons-material/ArrowOutwardRounded";
import DarkModeRounded from "@mui/icons-material/DarkModeRounded";
import LockRounded from "@mui/icons-material/LockRounded";
import WbSunnyRounded from "@mui/icons-material/WbSunnyRounded";
import type { Route } from "../App";

export type SecondaryNavConfig = {
  label: string;
  tabs: string[];
  active: string;
  count: number;
  countLabel: string;
  onSelect: (value: string) => void;
};

export function Nav({
  route,
  go,
  studioUnlocked,
  theme,
  toggleTheme,
  secondary,
}: {
  route: Route;
  go: (r: Route) => void;
  studioUnlocked: boolean;
  theme: "dark" | "light";
  toggleTheme: () => void;
  secondary?: SecondaryNavConfig | null;
}) {
  const headerRef = useRef<HTMLElement | null>(null);
  const secondaryRef = useRef<HTMLElement | null>(null);
  const [navOnDark, setNavOnDark] = useState(false);
  const [secondaryOnDark, setSecondaryOnDark] = useState(false);
  const items: { label: string; route: Route }[] = [
    { label: "Home", route: "home" },
    { label: "Work", route: "work" },
    { label: "Lab", route: "lab" },
  ];

  useEffect(() => {
    let raf = 0;
    const mediaCanvas = document.createElement("canvas");
    const mediaContext = mediaCanvas.getContext("2d", { willReadFrequently: true });
    mediaCanvas.width = 1;
    mediaCanvas.height = 1;

    const luminance = (value: string) => {
      const match = value.match(/rgba?\(([^)]+)\)/);
      if (!match) return null;
      const parts = match[1]
        .split(",")
        .map((part) => Number.parseFloat(part));
      const [r, g, b] = parts;
      const a = parts[3] ?? 1;
      if (!Number.isFinite(r) || !Number.isFinite(g) || !Number.isFinite(b) || a < 0.08) return null;
      return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    };

    const mediaLuminance = (element: Element, x: number, y: number) => {
      if (!mediaContext) return null;
      const isImage = element instanceof HTMLImageElement;
      const isVideo = element instanceof HTMLVideoElement;
      if (!isImage && !isVideo) return null;

      const sourceWidth = isImage ? element.naturalWidth : element.videoWidth;
      const sourceHeight = isImage ? element.naturalHeight : element.videoHeight;
      if (!sourceWidth || !sourceHeight) return null;

      const rect = element.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return null;

      const style = window.getComputedStyle(element);
      const objectFit = style.objectFit || "fill";
      let renderedWidth = rect.width;
      let renderedHeight = rect.height;

      if (objectFit === "contain" || objectFit === "scale-down") {
        const scale = Math.min(rect.width / sourceWidth, rect.height / sourceHeight);
        renderedWidth = sourceWidth * scale;
        renderedHeight = sourceHeight * scale;
      } else if (objectFit === "cover") {
        const scale = Math.max(rect.width / sourceWidth, rect.height / sourceHeight);
        renderedWidth = sourceWidth * scale;
        renderedHeight = sourceHeight * scale;
      }

      const offsetX = (rect.width - renderedWidth) / 2;
      const offsetY = (rect.height - renderedHeight) / 2;
      const localX = x - rect.left - offsetX;
      const localY = y - rect.top - offsetY;
      if (localX < 0 || localY < 0 || localX > renderedWidth || localY > renderedHeight) {
        return null;
      }

      const sx = Math.min(sourceWidth - 1, Math.max(0, Math.floor((localX / renderedWidth) * sourceWidth)));
      const sy = Math.min(sourceHeight - 1, Math.max(0, Math.floor((localY / renderedHeight) * sourceHeight)));

      try {
        mediaContext.clearRect(0, 0, 1, 1);
        mediaContext.drawImage(element as CanvasImageSource, sx, sy, 1, 1, 0, 0, 1, 1);
        const [r, g, b, a] = mediaContext.getImageData(0, 0, 1, 1).data;
        if (a < 20) return null;
        return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
      } catch {
        return 0.26;
      }
    };

    const sampleElementLuminance = (x: number, y: number, overlay: HTMLElement | null) => {
      const mediaElements = Array.from(document.querySelectorAll<HTMLImageElement | HTMLVideoElement>("img, video"));
      for (let index = mediaElements.length - 1; index >= 0; index -= 1) {
        const element = mediaElements[index];
        if (overlay?.contains(element)) continue;
        const rect = element.getBoundingClientRect();
        const blurReach = 24;
        if (
          x < rect.left - blurReach ||
          x > rect.right + blurReach ||
          y < rect.top - blurReach ||
          y > rect.bottom + blurReach
        ) {
          continue;
        }
        if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
          return 0.26;
        }
        const media = mediaLuminance(element, x, y);
        if (media !== null) return media;
      }

      const stack = document.elementsFromPoint(x, y);
      for (const element of stack) {
        if (overlay?.contains(element)) continue;
        const media = mediaLuminance(element, x, y);
        if (media !== null) return media;
      }

      for (const element of stack) {
        if (overlay?.contains(element)) continue;
        const style = window.getComputedStyle(element);
        const background = luminance(style.backgroundColor);
        if (background !== null) return background;
      }

      return null;
    };

    const isDarkSurface = (samples: number[]) => {
      if (!samples.length) return document.documentElement.classList.contains("theme-dark");

      const darkVotes = samples.filter((value) => value < 0.5).length;
      const average = samples.reduce((sum, value) => sum + value, 0) / samples.length;
      const sorted = [...samples].sort((a, b) => a - b);
      const median = sorted[Math.floor(sorted.length / 2)];

      return darkVotes / samples.length >= 0.45 || average < 0.48 || median < 0.43;
    };

    const sampleOverlay = (overlay: HTMLElement | null, yRatio: number) => {
      if (!overlay) return document.documentElement.classList.contains("theme-dark");
      const rect = overlay.getBoundingClientRect();
      const yRatios = [Math.max(0.25, yRatio - 0.2), yRatio, Math.min(0.82, yRatio + 0.2)];
      const xRatios = [0.1, 0.18, 0.3, 0.42, 0.54, 0.66, 0.78, 0.9];
      const samples: number[] = [];

      for (const yy of yRatios) {
        const y = Math.max(rect.top + rect.height * yy, 1);
        for (const xx of xRatios) {
          const x = rect.left + rect.width * xx;
          const value = sampleElementLuminance(x, y, overlay);
          if (value !== null) samples.push(value);
        }
      }

      return isDarkSurface(samples);
    };

    const update = () => {
      raf = 0;
      setNavOnDark(sampleOverlay(headerRef.current, 0.55));
      setSecondaryOnDark(sampleOverlay(secondaryRef.current, 0.82));
    };

    const schedule = () => {
      if (raf) return;
      raf = requestAnimationFrame(update);
    };

    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [route, theme, secondary]);

  return (
    <>
      <header ref={headerRef} className={`cw-glass-header ${navOnDark ? "is-on-dark" : "is-on-light"}`}>
        <nav className="cw-glass-wrapper" aria-label="Main navigation">
          <span className="cw-glass-effect" aria-hidden="true" />
          <div className="cw-glass-content">
            <button type="button" onClick={() => go("home")} className="cw-brand">
              <span>Carl Wang</span>
              <span className="cw-brand-muted">- studio</span>
            </button>

            <div className="cw-nav-links">
              {items.map((it) => {
                const active =
                  route === it.route ||
                  (it.route === "work" && route === "project") ||
                  (it.route === "lab" && route === "lab-detail");
                return (
                  <button
                    key={it.route}
                    type="button"
                    onClick={() => go(it.route)}
                    aria-current={active ? "page" : undefined}
                    className={`cw-nav-link ${active ? "is-active" : ""}`}
                  >
                    {it.label}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() =>
                  go(studioUnlocked ? "studio-unlocked" : "studio-locked")
                }
                aria-current={route.startsWith("studio") ? "page" : undefined}
                className={`cw-nav-link cw-nav-link-studio ${
                  route.startsWith("studio") ? "is-active" : ""
                }`}
              >
                Studio
                {!studioUnlocked && <LockRounded className="cw-nav-lock-icon" />}
              </button>
            </div>

            <div className="cw-nav-tools">
              <button
                type="button"
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="cw-theme-toggle"
              >
                {theme === "dark" ? (
                  <WbSunnyRounded className="w-4 h-4" />
                ) : (
                  <DarkModeRounded className="w-4 h-4" />
                )}
              </button>
              <button
                type="button"
                onClick={() => go("about")}
                className="cw-nav-action"
              >
                Contact <ArrowOutwardRounded className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </nav>
      </header>
      <section
        ref={secondaryRef}
        className={`cw-secondary-tabs ${secondary ? "is-visible" : ""} ${secondaryOnDark ? "is-on-dark" : "is-on-light"}`}
        aria-label={secondary?.label ?? "Secondary navigation"}
        aria-hidden={!secondary}
      >
        <div className="cw-secondary-tabs-inner">
          {secondary && (
            <div className="cw-secondary-panel is-current">
              <div
                className="cw-secondary-tab-list"
                role="tablist"
                aria-label={secondary.label}
              >
                {secondary.tabs.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    role="tab"
                    aria-selected={secondary.active === tab}
                    onClick={() => secondary.onSelect(tab)}
                    className={`cw-secondary-tab ${
                      secondary.active === tab ? "is-active" : ""
                    }`}
                  >
                    <span className="cw-secondary-tab-label">{tab}</span>
                  </button>
                ))}
              </div>
              <span className="cw-project-count">
                {secondary.count} {secondary.countLabel}
              </span>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

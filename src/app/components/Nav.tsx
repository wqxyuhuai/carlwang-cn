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
  const [navOnDark, setNavOnDark] = useState(false);
  const items: { label: string; route: Route }[] = [
    { label: "Work", route: "work" },
    { label: "Lab", route: "lab" },
  ];

  useEffect(() => {
    let raf = 0;

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

    const sampleElement = (x: number, y: number) => {
      const header = headerRef.current;
      const stack = document.elementsFromPoint(x, y);
      for (const element of stack) {
        if (header?.contains(element)) continue;
        const tag = element.tagName.toLowerCase();
        if (tag === "img" || tag === "video" || element.classList.contains("protected-media")) {
          return true;
        }
        const style = window.getComputedStyle(element);
        const background = luminance(style.backgroundColor);
        if (background !== null) return background < 0.42;
      }
      return document.documentElement.classList.contains("theme-dark");
    };

    const update = () => {
      raf = 0;
      const header = headerRef.current;
      if (!header) return;
      const rect = header.getBoundingClientRect();
      const y = Math.max(rect.top + rect.height * 0.55, 1);
      const xs = [rect.left + rect.width * 0.18, rect.left + rect.width * 0.5, rect.left + rect.width * 0.82];
      const darkCount = xs.filter((x) => sampleElement(x, y)).length;
      setNavOnDark(darkCount >= 2);
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
  }, [route, theme]);

  return (
    <>
      <header ref={headerRef} className={`cw-glass-header ${navOnDark ? "is-on-dark" : ""}`}>
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
        className={`cw-secondary-tabs ${secondary ? "is-visible" : ""}`}
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
                    {tab}
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

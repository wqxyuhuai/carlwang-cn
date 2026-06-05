import { Lock, Sun, Moon, ArrowUpRight } from "lucide-react";
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
  const items: { label: string; route: Route }[] = [
    { label: "Home", route: "home" },
    { label: "Work", route: "work" },
    { label: "Lab", route: "lab" },
    { label: "About", route: "about" },
  ];

  return (
    <>
      <header className="cw-glass-header">
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
                {!studioUnlocked && <Lock className="cw-nav-lock-icon" />}
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
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </button>
              <button
                type="button"
                onClick={() => go("about")}
                className="cw-nav-action"
              >
                Contact <ArrowUpRight className="w-3.5 h-3.5" />
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

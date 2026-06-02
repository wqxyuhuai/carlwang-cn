import { Lock, Sun, Moon, ArrowUpRight } from "lucide-react";
import type { Route } from "../App";

export function Nav({
  route,
  go,
  studioUnlocked,
  theme,
  toggleTheme,
}: {
  route: Route;
  go: (r: Route) => void;
  studioUnlocked: boolean;
  theme: "dark" | "light";
  toggleTheme: () => void;
}) {
  const items: { label: string; route: Route }[] = [
    { label: "Home", route: "home" },
    { label: "Work", route: "work" },
    { label: "Lab", route: "lab" },
    { label: "About", route: "about" },
  ];

  return (
    <header className="sticky top-0 z-40">
      <div className="absolute left-0 right-0 top-0 h-[76px] pointer-events-none frosted-bar border-b border-[color:var(--line-soft)]" />
      <div className="content-shell relative h-[76px] flex items-center justify-between">
        <button
          onClick={() => go("home")}
          className="flex items-center gap-2.5 group"
        >
          <span className="tracking-tight text-[var(--fg)]">Carl Wang</span>
          <span className="text-[var(--muted-2)] text-sm hidden sm:inline">
            - studio
          </span>
        </button>

        <nav className="flex items-center gap-0.5">
          {items.map((it) => {
            const active =
              route === it.route ||
              (it.route === "work" && route === "project") ||
              (it.route === "lab" && route === "lab-detail");
            return (
              <button
                key={it.route}
                onClick={() => go(it.route)}
                className={`px-4 h-9 rounded-full text-sm transition-colors ${
                  active
                    ? "bg-[var(--fg)] text-[var(--app-bg)]"
                    : "text-[var(--fg-2)] hover:text-[var(--fg)] hover:bg-[color:var(--hover)]"
                }`}
              >
                {it.label}
              </button>
            );
          })}
          <button
            onClick={() =>
              go(studioUnlocked ? "studio-unlocked" : "studio-locked")
            }
            className={`px-4 h-9 rounded-full text-sm flex items-center gap-1.5 transition-colors ${
              route.startsWith("studio")
                ? "bg-[var(--fg)] text-[var(--app-bg)]"
                : "text-[var(--fg-2)] hover:text-[var(--fg)] hover:bg-[color:var(--hover)]"
            }`}
          >
            Studio
            {!studioUnlocked && <Lock className="w-3.5 h-3.5 opacity-70" />}
          </button>
        </nav>

        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="w-10 h-10 rounded-full grid place-items-center text-[var(--fg-2)] hover:text-[var(--fg)] hover:bg-[color:var(--hover)] transition-colors"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => go("about")}
            className="h-10 px-5 rounded-full bg-[var(--accent)] text-[var(--accent-fg)] text-sm hover:opacity-90 transition-all flex items-center gap-1.5"
          >
            Contact <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}

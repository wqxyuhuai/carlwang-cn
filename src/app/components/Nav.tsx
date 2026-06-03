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
    <header className="sticky top-0 z-40 max-md:mb-[48px]">
      <div className="absolute left-0 right-0 top-0 h-[76px] pointer-events-none frosted-bar border-b border-[color:var(--line-soft)] max-md:h-[64px]" />
      <div className="content-shell relative grid h-[76px] grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center max-md:h-[64px] max-md:grid-cols-[1fr_auto] max-md:gap-2">
        <button
          onClick={() => go("home")}
          className="group flex min-w-0 items-center gap-2.5 justify-self-start"
        >
          <span className="truncate tracking-tight text-[var(--fg)]">Carl Wang</span>
          <span className="text-[var(--muted-2)] text-sm hidden sm:inline">
            - studio
          </span>
        </button>

        <nav className="flex items-center gap-1 justify-self-center max-md:fixed max-md:left-0 max-md:right-0 max-md:top-[64px] max-md:z-40 max-md:justify-start max-md:overflow-x-auto max-md:border-b max-md:border-[color:var(--line-soft)] max-md:bg-[var(--glass-strong)] max-md:px-4 max-md:py-2 max-md:backdrop-blur-xl">
          {items.map((it) => {
            const active =
              route === it.route ||
              (it.route === "work" && route === "project") ||
              (it.route === "lab" && route === "lab-detail");
            return (
              <button
                key={it.route}
                onClick={() => go(it.route)}
                className={`h-9 w-[78px] shrink-0 rounded-full text-center text-sm transition-colors max-md:w-auto max-md:px-4 ${
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
            className={`flex h-9 w-[94px] shrink-0 items-center justify-center gap-1.5 rounded-full text-sm transition-colors max-md:w-auto max-md:px-4 ${
              route.startsWith("studio")
                ? "bg-[var(--fg)] text-[var(--app-bg)]"
                : "text-[var(--fg-2)] hover:text-[var(--fg)] hover:bg-[color:var(--hover)]"
            }`}
          >
            Studio
            {!studioUnlocked && <Lock className="w-3.5 h-3.5 opacity-70" />}
          </button>
        </nav>

        <div className="flex items-center gap-1.5 justify-self-end max-md:col-start-2">
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
            className="h-10 px-5 rounded-full bg-[var(--accent)] text-[var(--accent-fg)] text-sm hover:opacity-90 transition-all flex items-center gap-1.5 max-md:hidden"
          >
            Contact <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}

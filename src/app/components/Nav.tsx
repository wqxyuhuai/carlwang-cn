import { useEffect, useRef } from "react";
import { Lock, Sun, Moon, ArrowUpRight } from "lucide-react";
import type { Route } from "../App";

type LiquidGlassInstance = {
  destroy: () => void;
  markChanged?: (element?: HTMLElement) => void;
};

type LiquidGlassModule = {
  LiquidGlass: {
    init: (options: {
      root: HTMLElement;
      glassElements: HTMLElement[];
      defaults?: Record<string, unknown>;
    }) => Promise<LiquidGlassInstance>;
  };
};

const LIQUID_GLASS_CDN =
  "https://cdn.jsdelivr.net/npm/@ybouane/liquidglass@1.0.3/dist/index.js";

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
  const rootRef = useRef<HTMLElement | null>(null);
  const glassRef = useRef<HTMLDivElement | null>(null);
  const instanceRef = useRef<LiquidGlassInstance | null>(null);

  useEffect(() => {
    let cancelled = false;
    let cleanupResize: (() => void) | undefined;

    async function setupLiquidGlass() {
      const root = rootRef.current;
      const glass = glassRef.current;
      if (!root || !glass) return;

      const mobile = window.matchMedia("(max-width: 767px)");
      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      );
      const canvas = document.createElement("canvas");
      const hasWebGL =
        Boolean(canvas.getContext("webgl2")) ||
        Boolean(canvas.getContext("webgl"));

      const fallback = () => {
        root.classList.add("liquidglass-nav-fallback");
        instanceRef.current?.destroy();
        instanceRef.current = null;
      };

      if (mobile.matches || reducedMotion.matches || !hasWebGL) {
        fallback();
        return;
      }

      try {
        const { LiquidGlass } = (await import(
          /* @vite-ignore */ LIQUID_GLASS_CDN
        )) as LiquidGlassModule;
        if (cancelled || !rootRef.current || !glassRef.current) return;

        root.classList.remove("liquidglass-nav-fallback");
        instanceRef.current = await LiquidGlass.init({
          root: rootRef.current,
          glassElements: [glassRef.current],
          defaults: {
            blurAmount: 0.12,
            refraction: 0.55,
            chromAberration: 0.025,
            edgeHighlight: 0.06,
            specular: 0.1,
            fresnel: 0.9,
            cornerRadius: 0,
            zRadius: 24,
            shadowOpacity: 0.14,
            button: false,
          },
        });

        if (cancelled) {
          instanceRef.current?.destroy();
          instanceRef.current = null;
          return;
        }

        const onResize = () => {
          if (mobile.matches) fallback();
        };
        mobile.addEventListener("change", onResize);
        cleanupResize = () => mobile.removeEventListener("change", onResize);
      } catch (error) {
        console.warn("LiquidGlass nav disabled", error);
        fallback();
      }
    }

    setupLiquidGlass();

    return () => {
      cancelled = true;
      cleanupResize?.();
      instanceRef.current?.destroy();
      instanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    instanceRef.current?.markChanged?.(glassRef.current ?? undefined);
  }, [route, studioUnlocked, theme]);

  return (
    <header
      ref={rootRef}
      className="wattsonic-nav liquidglass-nav-root sticky top-0 z-40"
    >
      <div
        ref={glassRef}
        aria-hidden="true"
        className="liquidglass-nav-shell liquidglass-nav-bar"
      />
      <div className="content-shell relative z-[1] grid h-11 grid-cols-[minmax(190px,1fr)_auto_minmax(190px,1fr)] items-center max-md:h-[96px] max-md:grid-cols-[1fr_auto] max-md:gap-2">
          <button
            onClick={() => go("home")}
            className="group flex min-w-0 items-center gap-2.5 justify-self-start"
          >
            <span className="truncate text-[var(--fg)]">Carl Wang</span>
            <span className="text-[var(--muted-2)] text-sm hidden sm:inline">
              - studio
            </span>
          </button>

          <nav className="flex w-[422px] items-center justify-center gap-1 justify-self-center max-md:absolute max-md:left-3 max-md:right-3 max-md:top-[52px] max-md:w-auto max-md:justify-start max-md:overflow-x-auto max-md:rounded-full max-md:bg-[rgba(255,255,255,0.58)] max-md:px-2 max-md:py-2 max-md:backdrop-blur-xl">
            {items.map((it) => {
              const active =
                route === it.route ||
                (it.route === "work" && route === "project") ||
                (it.route === "lab" && route === "lab-detail");
              return (
                <button
                  key={it.route}
                  onClick={() => go(it.route)}
                  className={`h-9 w-[78px] shrink-0 rounded-full text-center text-sm transition-all duration-300 max-md:w-auto max-md:px-4 ${
                    active
                      ? "bg-[var(--fg)] text-[var(--app-bg)] shadow-[0_14px_30px_-20px_rgba(0,0,0,0.75)]"
                      : "text-[var(--fg-2)] hover:text-[var(--fg)] hover:bg-[rgba(255,255,255,0.28)]"
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
              className={`flex h-9 w-[94px] shrink-0 items-center justify-center gap-1.5 rounded-full text-sm transition-all duration-300 max-md:w-auto max-md:px-4 ${
                route.startsWith("studio")
                  ? "bg-[var(--fg)] text-[var(--app-bg)] shadow-[0_14px_30px_-20px_rgba(0,0,0,0.75)]"
                  : "text-[var(--fg-2)] hover:text-[var(--fg)] hover:bg-[rgba(255,255,255,0.28)]"
              }`}
            >
              Studio
              {!studioUnlocked && <Lock className="w-3.5 h-3.5 opacity-70" />}
            </button>
          </nav>

          <div className="flex items-center gap-3 justify-self-end max-md:col-start-2 max-md:gap-1.5">
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="grid h-10 w-10 place-items-center rounded-full text-[var(--fg-2)] transition-all hover:bg-[rgba(255,255,255,0.28)] hover:text-[var(--fg)]"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => go("about")}
              className="flex h-8 items-center gap-1.5 rounded-full bg-[var(--accent)] px-5 text-sm text-[var(--accent-fg)] transition-opacity hover:opacity-85 max-md:hidden"
            >
              Contact <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
      </div>
    </header>
  );
}

import { useEffect, useRef, useState } from "react";
import { Nav } from "./components/Nav";
import { Footer } from "./components/Footer";
import { Home } from "./components/Home";
import { Work } from "./components/Work";
import { ProjectDetail } from "./components/ProjectDetail";
import { Lab } from "./components/Lab";
import { LabDetail } from "./components/LabDetail";
import { About } from "./components/About";
import { StudioLocked } from "./components/StudioLocked";
import { StudioUnlocked } from "./components/StudioUnlocked";
import { Loader } from "./components/Loader";

export type Route =
  | "home"
  | "work"
  | "project"
  | "lab"
  | "lab-detail"
  | "about"
  | "studio-locked"
  | "studio-unlocked";

type Theme = "dark" | "light";

export default function App() {
  const [route, setRoute] = useState<Route>("home");
  const [projectId, setProjectId] = useState<string>("wattdesk");
  const [labId, setLabId] = useState<string>("gh-calendar");
  const [studioUnlocked, setStudioUnlocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      return (
        (localStorage.getItem("cw-theme") as Theme | null) ?? "light"
      );
    } catch {
      return "light";
    }
  });
  const glowRef = useRef<HTMLDivElement | null>(null);
  const mainRef = useRef<HTMLElement | null>(null);

  // mouse-follow cursor glow
  useEffect(() => {
    let raf = 0;
    let tx = 50,
      ty = 50;
    const onMove = (e: MouseEvent) => {
      tx = (e.clientX / window.innerWidth) * 100;
      ty = (e.clientY / window.innerHeight) * 100;
      if (!raf) {
        raf = requestAnimationFrame(() => {
          if (glowRef.current) {
            glowRef.current.style.setProperty("--mx", `${tx}%`);
            glowRef.current.style.setProperty("--my", `${ty}%`);
          }
          raf = 0;
        });
      }
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("cw-theme", theme);
    } catch {}
    // Apply theme to document root so body can inherit CSS variables
    document.documentElement.className = theme === "dark" ? "theme-dark" : "theme-light";
  }, [theme]);

  // scroll-triggered blur reveal — observes any .reveal-up element in current page
  useEffect(() => {
    if (loading) return;
    const root = mainRef.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.08 },
    );
    const els = root.querySelectorAll<HTMLElement>(".reveal-up");
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [route, loading]);

  const go = (r: Route) => {
    if (r === "studio-locked" && studioUnlocked) {
      setRoute("studio-unlocked");
    } else {
      setRoute(r);
    }
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  };
  const openProject = (id: string) => {
    setProjectId(id);
    setRoute("project");
    window.scrollTo({ top: 0 });
  };
  const openLab = (id: string) => {
    setLabId(id);
    setRoute("lab-detail");
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="min-h-screen relative isolate">
      {loading && <Loader onDone={() => setLoading(false)} />}
      <div ref={glowRef} className="cursor-glow" />
      <div className="relative z-10">
        <Nav
          route={route}
          go={go}
          studioUnlocked={studioUnlocked}
          theme={theme}
          toggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
        />
        <main
          ref={mainRef}
          key={route /* re-trigger reveal animation per route */}
        >
          {route === "home" && <Home go={go} openProject={openProject} openLab={openLab} />}
          {route === "work" && <Work openProject={openProject} />}
          {route === "project" && (
            <ProjectDetail
              id={projectId}
              go={go}
              openProject={openProject}
            />
          )}
          {route === "lab" && <Lab openLab={openLab} />}
          {route === "lab-detail" && <LabDetail id={labId} go={go} />}
          {route === "about" && <About />}
          {route === "studio-locked" && (
            <StudioLocked
              go={go}
              onUnlock={() => {
                setStudioUnlocked(true);
                setRoute("studio-unlocked");
              }}
            />
          )}
          {route === "studio-unlocked" && (
            <StudioUnlocked
              go={go}
              onLock={() => setStudioUnlocked(false)}
            />
          )}
        </main>
        {!route.startsWith("studio") && <Footer />}
      </div>
    </div>
  );
}

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
import { useContent } from "./contentStore";

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

function getTodayKey() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export default function App() {
  const { content } = useContent();
  const [route, setRoute] = useState<Route>("home");
  const [projectId, setProjectId] = useState<string>("wattdesk");
  const [labId, setLabId] = useState<string>("gh-calendar");
  const [studioUnlocked, setStudioUnlocked] = useState(false);
  const todayKey = getTodayKey();
  const [loading, setLoading] = useState(() => {
    try {
      return localStorage.getItem("cw-loader-date") !== todayKey;
    } catch {
      return true;
    }
  });
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

  const findProjectBySlug = (slug: string) =>
    content.projects.find((project) => (project.slug || project.id) === slug || project.id === slug);
  const findLabBySlug = (slug: string) =>
    content.labItems.find((item) => (item.slug || item.id) === slug || item.id === slug);
  const projectPath = (id: string) => {
    const project = content.projects.find((entry) => entry.id === id);
    return `/work/${project?.slug || project?.id || id}`;
  };
  const labPath = (id: string) => {
    const item = content.labItems.find((entry) => entry.id === id);
    return `/lab/${item?.slug || item?.id || id}`;
  };
  const currentPath = (nextRoute: Route, nextProjectId = projectId, nextLabId = labId) => {
    if (nextRoute === "work") return "/work";
    if (nextRoute === "project") return projectPath(nextProjectId);
    if (nextRoute === "lab") return "/lab";
    if (nextRoute === "lab-detail") return labPath(nextLabId);
    if (nextRoute === "about") return "/about";
    if (nextRoute.startsWith("studio")) return "/studio";
    return "/";
  };
  const syncFromPath = () => {
    const path = window.location.pathname.replace(/\/+$/, "") || "/";
    const segments = path.split("/").filter(Boolean);
    const baseOffset = segments[0] === "carlwang-cn" ? 1 : 0;
    const first = segments[baseOffset];
    const second = segments[baseOffset + 1];

    if (!first) {
      setRoute("home");
      return;
    }
    if (first === "work") {
      if (second) {
        const project = findProjectBySlug(second);
        if (project) setProjectId(project.id);
        setRoute("project");
        return;
      }
      setRoute("work");
      return;
    }
    if (first === "lab") {
      if (second) {
        const item = findLabBySlug(second);
        if (item) setLabId(item.id);
        setRoute("lab-detail");
        return;
      }
      setRoute("lab");
      return;
    }
    if (first === "about") {
      setRoute("about");
      return;
    }
    if (first === "studio") {
      setRoute(studioUnlocked ? "studio-unlocked" : "studio-locked");
      return;
    }
    setRoute("home");
  };

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

  useEffect(() => {
    const storedPath = sessionStorage.getItem("cw-spa-path");
    if (storedPath) {
      sessionStorage.removeItem("cw-spa-path");
      window.history.replaceState({}, "", storedPath);
    }
    syncFromPath();
    const onPopState = () => syncFromPath();
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [content.projects, content.labItems, studioUnlocked]);

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
    const nextRoute = r === "studio-locked" && studioUnlocked ? "studio-unlocked" : r;
    const path = currentPath(nextRoute);
    if (window.location.pathname !== path) {
      window.history.pushState({}, "", path);
    }
    setRoute(nextRoute);
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  };
  const openProject = (id: string) => {
    setProjectId(id);
    const path = projectPath(id);
    if (window.location.pathname !== path) {
      window.history.pushState({}, "", path);
    }
    setRoute("project");
    window.scrollTo({ top: 0 });
  };
  const openLab = (id: string) => {
    setLabId(id);
    const path = labPath(id);
    if (window.location.pathname !== path) {
      window.history.pushState({}, "", path);
    }
    setRoute("lab-detail");
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="min-h-screen relative isolate">
      {loading && (
        <Loader
          onDone={() => {
            try {
              localStorage.setItem("cw-loader-date", todayKey);
            } catch {}
            setLoading(false);
          }}
        />
      )}
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
                window.history.pushState({}, "", "/studio");
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

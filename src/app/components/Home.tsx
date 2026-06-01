import { useEffect, useRef } from "react";
import {
  ArrowUpRight,
  Layers,
  Sparkles,
  Video,
  Wrench,
  Github,
  Globe,
  Compass,
  Mail,
  Palette,
  BookOpen,
  Brush,
  Linkedin,
} from "lucide-react";
import type { Route } from "../App";
import { useContent } from "../contentStore";
import { CoverArt } from "./CoverArt";

const iconMap: Record<string, any> = {
  Mail,
  Github,
  Palette,
  BookOpen,
  Brush,
  Linkedin,
};

const capIcons = [Layers, Sparkles, Video, Wrench];
const labIcons: Record<string, typeof Github> = {
  GitHub: Github,
  "Web Tools": Globe,
  Notes: Compass,
  "Design Experiments": Sparkles,
  "Mini Program": Wrench,
};

export function Home({
  go,
  openProject,
  openLab,
}: {
  go: (r: Route) => void;
  openProject: (id: string) => void;
  openLab: (id: string) => void;
}) {
  const { content } = useContent();
  const featuredWork = content.projects
    .filter((project) => project.status === "Published" && project.featured)
    .sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999));
  const visibleLabItems = content.labItems.filter((item) => !item.hidden);
  const { settings, socials } = content;

  return (
    <div>
      <section className="relative overflow-hidden">
        {/* large ambient parallax blobs */}
        <ParallaxBlobs />
        <div className="mx-auto max-w-[1440px] px-10 pt-24 pb-32 relative">
          <div className="reveal reveal-1 flex items-center gap-3 text-[var(--muted)] text-sm mb-14">
            <span className="dot-accent" />
            Available for select projects
          </div>
          <h1
            className="display reveal reveal-2 text-[var(--fg)] max-w-5xl"
            style={{ fontSize: 72, lineHeight: 1.1 }}
          >
            {settings.slogan}
            <br />
            {settings.role}
          </h1>
          <div className="reveal reveal-3 mt-16 flex gap-3">
            <button
              onClick={() => go("work")}
              className="h-12 px-6 rounded-full border border-[color:var(--line-strong)] text-[var(--fg)] flex items-center gap-2 hover:bg-[color:var(--hover)] hover:border-[color:var(--accent)]/40 transition-all"
            >
              View Work <ArrowUpRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => go("lab")}
              className="h-12 px-6 rounded-full border border-[color:var(--line-strong)] text-[var(--fg)] flex items-center gap-2 hover:bg-[color:var(--hover)] hover:border-[color:var(--accent)]/40 transition-all"
            >
              <Compass className="w-4 h-4" /> Explore Lab
            </button>
          </div>

          <div className="reveal reveal-4 mt-20 relative h-[320px] rounded-3xl overflow-hidden card">
            <FloatingTiles />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-10 py-24 relative">
        <SectionHeader
          title="Work"
          link="See all"
          onLink={() => go("work")}
        />
        <div className="relative mt-12 -mx-10 px-10 overflow-hidden">
          <div className="flex gap-0 -ml-4">
            {featuredWork.map((p, i) => (
              <button
                key={p.id}
                onClick={() => openProject(p.id)}
                className="reveal-up group flex-shrink-0 w-[420px] -ml-16 first:ml-0 hover:z-10 transition-all duration-300 hover:scale-105"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="card overflow-hidden text-left">
                  <div className="relative aspect-[16/11] overflow-hidden">
                    {p.coverImage ? (
                      <img
                        src={p.coverImage}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <CoverArt index={i} />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--app-bg)] via-transparent to-transparent opacity-60" />
                    <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[var(--fg)] text-[var(--app-bg)] grid place-items-center opacity-0 group-hover:opacity-100 transition-all">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="text-[var(--muted-2)] text-[10px] tracking-[0.22em] uppercase mb-2">
                      {p.category}
                    </div>
                    <div className="display text-[var(--fg)] mb-1" style={{ fontSize: 24 }}>
                      {p.title}
                    </div>
                    <p className="text-[var(--muted)] text-sm leading-relaxed line-clamp-2">
                      {p.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-10 py-24 relative">
        <SectionHeader
          title="Lab"
          link="Enter Lab"
          onLink={() => go("lab")}
        />
        <div className="relative mt-12 -mx-10 px-10 overflow-hidden">
          <div className="flex gap-0 -ml-4">
            {visibleLabItems.slice(0, 4).map((it, i) => {
              const Icon = labIcons[it.type] ?? Sparkles;
              return (
                <button
                  key={it.id}
                  onClick={() => openLab(it.id)}
                  className="reveal-up group flex-shrink-0 w-[360px] -ml-12 first:ml-0 hover:z-10 transition-all duration-300 hover:scale-105"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="card overflow-hidden text-left">
                    <div className="relative aspect-[16/11] overflow-hidden">
                      {it.coverImage ? (
                        <img
                          src={it.coverImage}
                          alt=""
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <>
                          <div
                            className="absolute inset-0 opacity-70"
                            style={{
                              backgroundImage:
                                "linear-gradient(var(--line) 1px,transparent 1px),linear-gradient(90deg,var(--line) 1px,transparent 1px)",
                              backgroundSize: "32px 32px",
                            }}
                          />
                          <div className="absolute inset-0 grid place-items-center text-[var(--accent)]">
                            <Icon className="w-8 h-8" />
                          </div>
                        </>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[var(--app-bg)] via-transparent to-transparent opacity-60" />
                    </div>
                    <div className="p-6">
                      <div className="display text-[var(--fg)]" style={{ fontSize: 20 }}>
                        {it.title}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-10 py-24 relative">
        <SectionHeader
          title="About"
          link="More info"
          onLink={() => go("about")}
        />
        <div className="grid grid-cols-12 gap-8 mt-12">
          <div className="col-span-7 reveal-up">
            <p className="text-[var(--fg-2)] text-lg leading-relaxed mb-8">
              I work between product logic and visual expression. I like building
              things that are useful, clear and a little bit delightful.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {socials.slice(0, 4).map((s) => {
                const Icon = iconMap[s.icon as string];
                return (
                  <a
                    key={s.name}
                    href={s.href}
                    className="rounded-xl border border-[color:var(--line)] bg-[color:var(--surface)] px-5 py-4 hover:border-[color:var(--accent)]/40 transition-all flex items-center gap-3 group"
                  >
                    {Icon && <Icon className="w-4 h-4 text-[var(--muted-2)] group-hover:text-[var(--accent)] transition-colors" />}
                    <span className="text-[var(--fg)]">{s.name}</span>
                  </a>
                );
              })}
            </div>
          </div>
          <div className="col-span-5 reveal-up">
            <div className="rounded-2xl border border-[color:var(--line)] p-8 bg-[color:var(--surface)] h-full">
              <div className="text-[var(--muted-2)] text-xs tracking-[0.2em] uppercase mb-6">
                Focus
              </div>
              <div className="space-y-4">
                {["Product & UI", "Visual & Brand", "Motion & Video"].map((f) => (
                  <div
                    key={f}
                    className="text-[var(--fg)] flex items-center gap-3"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                    {f}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionHeader({
  title,
  link,
  onLink,
}: {
  title: string;
  link?: string;
  onLink?: () => void;
}) {
  return (
    <div className="reveal-up flex items-end justify-between pb-6 border-b border-[color:var(--line)]">
      <div className="flex items-baseline gap-6">
        <h3
          className="display text-[var(--fg)]"
          style={{ fontSize: 38, lineHeight: 1 }}
        >
          {title}
        </h3>
      </div>
      {link && (
        <button
          onClick={onLink}
          className="link text-[var(--muted)] hover:text-[var(--fg)] text-sm inline-flex items-center gap-1"
        >
          {link} <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------- */

function ParallaxBlobs() {
  return null;
}

function CTABlob() {
  return null;
}

function FloatingTiles() {
  const ref = useRef<HTMLDivElement | null>(null);
  const tiles = [
    { label: "Dashboard", x: 5, y: 18, w: 230, h: 140, depth: 1.2 },
    { label: "Brochure", x: 30, y: 52, w: 190, h: 120, depth: 0.6 },
    { label: "Motion 04", x: 55, y: 8, w: 210, h: 130, depth: 1.6 },
    { label: "Brand v2", x: 76, y: 56, w: 180, h: 100, depth: 0.8 },
    { label: "iMaster", x: 16, y: 66, w: 170, h: 90, depth: 1.0 },
  ];

  useEffect(() => {
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      if (!ref.current) return;
      const r = ref.current.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      if (!raf) {
        raf = requestAnimationFrame(() => {
          if (ref.current) {
            ref.current.style.setProperty("--tx", `${x}`);
            ref.current.style.setProperty("--ty", `${y}`);
          }
          raf = 0;
        });
      }
    };
    const el = ref.current;
    el?.addEventListener("mousemove", onMove);
    return () => el?.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div ref={ref} className="absolute inset-0">
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "linear-gradient(var(--line) 1px,transparent 1px),linear-gradient(90deg,var(--line) 1px,transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage:
            "radial-gradient(ellipse at center, black, transparent 80%)",
        }}
      />
      {tiles.map((t, i) => (
        <div
          key={i}
          className="absolute rounded-xl glass p-3 drift"
          style={{
            left: `${t.x}%`,
            top: `${t.y}%`,
            width: t.w,
            height: t.h,
            animationDelay: `${i * 600}ms`,
            transform: `translate3d(calc(var(--tx,0) * ${t.depth * 24}px), calc(var(--ty,0) * ${t.depth * 24}px), 0)`,
            transition: "transform 200ms cubic-bezier(0.22,0.61,0.36,1)",
          }}
        >
          <div className="text-[var(--muted-2)] text-[10px] tracking-[0.22em] uppercase">
            {t.label}
          </div>
          <div className="mt-2 space-y-1.5">
            <div
              className="h-1.5 w-2/3 rounded-full"
              style={{ background: "var(--accent)" }}
            />
            <div className="h-1.5 w-1/2 rounded-full bg-[color:var(--line-strong)]" />
            <div className="h-1.5 w-3/4 rounded-full bg-[color:var(--line)]" />
          </div>
        </div>
      ))}
      <div className="absolute bottom-5 right-6 text-[var(--muted-3)] text-xs tracking-[0.22em] uppercase">
        Fragments
      </div>
    </div>
  );
}

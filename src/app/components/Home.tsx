import {
  ArrowUpRight,
  Github,
  Compass,
  Mail,
  Palette,
  BookOpen,
  Brush,
  Linkedin,
} from "lucide-react";
import type { Route } from "../App";
import { useContent } from "../contentStore";

const iconMap: Record<string, any> = {
  Mail,
  Github,
  Palette,
  BookOpen,
  Brush,
  Linkedin,
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
  const featuredLabItems = content.labItems
    .filter((item) => !item.hidden && item.featured)
    .slice(0, 4);
  const { settings, socials } = content;

  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="content-shell pt-24 pb-24 relative">
          <div className="reveal reveal-1 text-[var(--muted)] text-sm mb-12">
            Available for select projects
          </div>
          <h1
            className="display reveal reveal-2 text-[var(--fg)] max-w-4xl"
            style={{ fontSize: 64, lineHeight: 1.08 }}
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
        </div>
      </section>

      <section className="content-shell py-20 relative">
        <SectionHeader
          title="Work"
          link="See all"
          onLink={() => go("work")}
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featuredWork.map((p, i) => (
            <button
              key={p.id}
              onClick={() => openProject(p.id)}
              className="reveal-up group text-left"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="card overflow-hidden">
                {p.coverImage && (
                  <div className="relative aspect-[16/11] overflow-hidden bg-[color:var(--surface-2)]">
                      <img
                        src={p.coverImage}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      />
                  </div>
                )}
                <div className="p-5">
                  <div className="text-[var(--muted-2)] text-[10px] tracking-[0.22em] uppercase mb-2">
                    {p.category}
                  </div>
                  <div className="display text-[var(--fg)] mb-2" style={{ fontSize: 22 }}>
                    {p.title}
                  </div>
                  <p className="text-[var(--muted)] text-sm leading-relaxed line-clamp-2">
                    {summaryFromRichContent(p.richContent, p.content)}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="content-shell py-20 relative">
        <SectionHeader
          title="Lab"
          link="Enter Lab"
          onLink={() => go("lab")}
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featuredLabItems.map((it, i) => (
            <button
              key={it.id}
              onClick={() => openLab(it.id)}
              className="reveal-up group text-left"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="card overflow-hidden">
                {it.coverImage && (
                  <div className="relative aspect-[16/11] overflow-hidden bg-[color:var(--surface-2)]">
                        <img
                          src={it.coverImage}
                          alt=""
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                        />
                  </div>
                )}
                <div className="p-5">
                  <div className="text-[var(--muted-2)] text-[10px] tracking-[0.22em] uppercase mb-2">
                    {it.type}
                  </div>
                  <div className="display text-[var(--fg)]" style={{ fontSize: 20 }}>
                    {it.title}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="content-shell py-20 relative">
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
                    className="text-[var(--fg)]"
                  >
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

function summaryFromRichContent(
  blocks?: { type: string; value: string }[],
  fallback?: string,
) {
  const text =
    blocks?.find((block) => block.type === "text" && block.value.trim())?.value ||
    fallback ||
    "";
  return text.replace(/\s+/g, " ").trim();
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

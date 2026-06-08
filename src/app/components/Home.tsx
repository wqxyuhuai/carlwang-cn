import ArrowOutwardRounded from "@mui/icons-material/ArrowOutwardRounded";
import DesignServicesRounded from "@mui/icons-material/DesignServicesRounded";
import InterestsRounded from "@mui/icons-material/InterestsRounded";
import type { Route } from "../App";
import { useContent } from "../contentStore";
import { sortByDisplayOrder } from "../contentOrdering";
import { ContentCard } from "./ContentCard";
import { SocialIcon } from "./SocialIcon";

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
  const publishedWork = sortByDisplayOrder(
    content.projects.filter((project) => project.status === "Published"),
  );
  const publishedLabItems = sortByDisplayOrder(
    content.labItems.filter((item) => !item.hidden),
  );
  const featuredWorkSource = publishedWork.filter((project) => project.featured);
  const featuredLabSource = publishedLabItems.filter((item) => item.featured);
  const featuredWork = (featuredWorkSource.length ? featuredWorkSource : publishedWork).slice(0, 4);
  const featuredLabItems = (featuredLabSource.length ? featuredLabSource : publishedLabItems).slice(0, 4);
  const { settings, socials } = content;

  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="content-shell pt-40 pb-24 relative max-md:pt-28 max-md:pb-14">
          <h1
            className="display reveal reveal-2 text-[var(--fg)] max-w-4xl max-md:text-[42px]"
            style={{ fontSize: "clamp(42px, 10vw, 64px)", lineHeight: 1.08 }}
          >
            {settings.slogan}
            <br />
            {settings.role}
          </h1>
          <div className="reveal reveal-3 mt-16 flex gap-3 max-md:mt-10 max-md:flex-col">
            <button
              onClick={() => go("work")}
              className="h-12 px-6 rounded-full border border-[color:var(--line-strong)] text-[var(--fg)] flex items-center justify-center gap-2 hover:bg-[color:var(--hover)] hover:border-[color:var(--accent)]/40 transition-all"
            >
              <DesignServicesRounded className="home-cta-icon" /> View Work
            </button>
            <button
              onClick={() => go("lab")}
              className="h-12 px-6 rounded-full border border-[color:var(--line-strong)] text-[var(--fg)] flex items-center justify-center gap-2 hover:bg-[color:var(--hover)] hover:border-[color:var(--accent)]/40 transition-all"
            >
              <InterestsRounded className="home-cta-icon" /> Explore Lab
            </button>
          </div>
        </div>
      </section>

      <section className="content-shell py-20 relative max-md:py-12">
        <SectionHeader
          title="Work"
          link="See all"
          onLink={() => go("work")}
        />
        <div className="mt-10 grid gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-4 max-md:mt-6 max-md:gap-y-7">
          {featuredWork.map((p, i) => (
            <ContentCard
              key={p.id}
              onClick={() => openProject(p.id)}
              title={p.title}
              coverImage={p.coverImage}
              className="reveal-up"
              style={{ animationDelay: `${i * 60}ms` }}
            />
          ))}
        </div>
      </section>

      <section className="content-shell py-20 relative max-md:py-12">
        <SectionHeader
          title="Lab"
          link="Enter Lab"
          onLink={() => go("lab")}
        />
        <div className="mt-10 grid gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-4 max-md:mt-6 max-md:gap-y-7">
          {featuredLabItems.map((it, i) => (
            <ContentCard
              key={it.id}
              onClick={() => openLab(it.id)}
              title={it.title}
              coverImage={it.coverImage}
              className="reveal-up"
              style={{ animationDelay: `${i * 60}ms` }}
            />
          ))}
        </div>
      </section>

      <section className="content-shell py-20 relative max-md:py-12">
        <SectionHeader
          title="About"
          link="More info"
          onLink={() => go("about")}
        />
        <div className="grid grid-cols-12 gap-8 mt-12 max-md:mt-6 max-md:grid-cols-1">
          <div className="col-span-7 reveal-up max-md:col-span-1">
            <p className="text-[var(--fg-2)] text-lg leading-relaxed mb-8">
              I work between product logic and visual expression. I like building
              things that are useful, clear and a little bit delightful.
            </p>
            <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
              {socials.slice(0, 4).map((s) => {
                return (
                  <a
                    key={s.name}
                    href={s.href}
                    className="rounded-xl border border-[color:var(--line)] bg-[color:var(--surface)] px-5 py-4 hover:border-[color:var(--accent)]/40 transition-all flex items-center gap-3 group"
                  >
                    <SocialIcon name={s.icon} className="social-icon w-4 h-4" />
                    <span className="text-[var(--fg)]">{s.name}</span>
                  </a>
                );
              })}
            </div>
          </div>
          <div className="col-span-5 reveal-up max-md:col-span-1">
            <div className="rounded-2xl border border-[color:var(--line)] p-8 bg-[color:var(--surface)] h-full">
              <div className="text-[var(--muted-2)] text-xs tracking-normal uppercase mb-6">
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
    <div className="reveal-up flex items-end justify-between gap-4">
      <div className="flex items-baseline gap-6">
        <h3
          className="display text-[var(--fg)]"
          style={{ fontSize: "clamp(30px, 8vw, 38px)", lineHeight: 1 }}
        >
          {title}
        </h3>
      </div>
      {link && (
        <button
          onClick={onLink}
          className="link text-[var(--muted)] hover:text-[var(--fg)] text-sm inline-flex items-center gap-1"
        >
          {link} <ArrowOutwardRounded className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

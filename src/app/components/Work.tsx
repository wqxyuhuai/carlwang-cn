import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { workCategories } from "../data";
import { useContent } from "../contentStore";
import { CoverArt } from "./CoverArt";

export function Work({ openProject }: { openProject: (id: string) => void }) {
  const { content } = useContent();
  const [active, setActive] = useState("All");
  const publicWork = content.projects
    .filter((project) => project.status === "Published")
    .sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999));
  const visible =
    active === "All"
      ? publicWork
      : publicWork.filter((w) => w.category === active);

  return (
    <div>
      <section className="mx-auto max-w-[1440px] px-10 pt-24 pb-16">
        <h1
          className="display text-[var(--fg)]"
          style={{ fontSize: 132, lineHeight: 0.94 }}
        >
          Selected <span className="text-[var(--muted)]">work</span>
        </h1>
      </section>

      <section className="sticky top-[76px] z-30">
        <div className="absolute left-0 right-0 top-0 bottom-0 pointer-events-none frosted-bar border-b border-[color:var(--line-soft)]" />
        <div className="relative mx-auto max-w-[1440px] px-10 py-4 flex items-center gap-2 flex-wrap">
          {workCategories.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={`h-9 px-4 rounded-full text-sm transition-all ${
                active === c
                  ? "bg-[var(--fg)] text-[var(--app-bg)]"
                  : "border border-[color:var(--line)] text-[var(--fg-2)] hover:bg-[color:var(--hover)] hover:border-[color:var(--line-strong)]"
              }`}
            >
              {c}
            </button>
          ))}
          <span className="ml-auto text-[var(--muted-2)] text-sm">
            {visible.length} project{visible.length !== 1 && "s"}
          </span>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-10 py-16">
        <div className="grid grid-cols-2 gap-6">
          {visible.map((p, i) => (
            <button
              key={p.id}
              onClick={() => openProject(p.id)}
              className="group text-left rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] overflow-hidden hover:border-[color:var(--accent)]/40 transition-all hover:-translate-y-1 duration-300"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                {p.coverImage ? (
                  <img
                    src={p.coverImage}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <CoverArt index={i} />
                )}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-[color:var(--app-bg)]/70 backdrop-blur text-xs text-[var(--fg)] border border-[color:var(--line)]">
                    {p.category}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-[var(--fg)] text-2xl tracking-tight mb-1">
                      {p.title}
                    </div>
                    <div className="text-[var(--muted-2)] text-sm">
                      {p.role}
                    </div>
                  </div>
                  <div className="w-9 h-9 rounded-full border border-[color:var(--line-strong)] grid place-items-center group-hover:bg-[var(--fg)] group-hover:text-[var(--app-bg)] transition-colors">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-[var(--muted)] text-sm leading-relaxed mt-4">
                  {p.description}
                </p>
              </div>
            </button>
          ))}
        </div>
        {visible.length === 0 && (
          <div className="text-[var(--muted-2)] text-center py-24">
            Nothing in this category yet. Try another filter.
          </div>
        )}
      </section>
    </div>
  );
}

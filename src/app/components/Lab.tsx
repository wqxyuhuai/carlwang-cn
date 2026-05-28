import { useState } from "react";
import { Github, ExternalLink } from "lucide-react";
import { labCategories } from "../data";
import { useContent } from "../contentStore";

export function Lab({ openLab }: { openLab: (id: string) => void }) {
  const { content } = useContent();
  const [active, setActive] = useState("All");
  const publicLabItems = content.labItems.filter((item) => !item.hidden);
  const visible =
    active === "All"
      ? publicLabItems
      : publicLabItems.filter((l) => l.type === active);

  return (
    <div>
      <section className="mx-auto max-w-[1440px] px-10 pt-24 pb-12">
        <h1
          className="display text-[var(--fg)]"
          style={{ fontSize: 132, lineHeight: 0.94 }}
        >
          Creative <span className="text-[var(--accent)]">Lab</span>
        </h1>
      </section>

      <section className="sticky top-[76px] z-30">
        <div className="absolute left-0 right-0 top-0 bottom-0 pointer-events-none frosted-bar border-b border-[color:var(--line-soft)]" />
        <div className="relative mx-auto max-w-[1440px] px-10 py-4 flex items-center gap-2 flex-wrap">
          {labCategories.map((c) => (
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
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-10 py-16 grid grid-cols-3 gap-4">
        {visible.map((it) => (
          <button
            key={it.id}
            onClick={() => openLab(it.id)}
            className="group text-left rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] p-6 hover:border-[color:var(--accent)]/40 transition-colors flex flex-col"
          >
            <div className="flex items-center gap-2 mb-6">
              <span className={`px-2 py-0.5 rounded-full text-xs ${statusColor(it.status)}`}>
                {it.status}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[color:var(--hover)] text-[var(--fg-2)] text-xs">
                {it.type}
              </span>
            </div>
            <div className="aspect-[5/3] rounded-xl bg-[color:var(--surface-2)] border border-[color:var(--line-soft)] mb-5 relative overflow-hidden">
              {it.coverImage ? (
                <img src={it.coverImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
              ) : (
                <div className="absolute bottom-3 left-3 text-[var(--muted-2)] text-[10px] tracking-[0.2em] uppercase">
                  Preview
                </div>
              )}
            </div>
            <div className="text-[var(--fg)] text-xl tracking-tight mb-2">
              {it.title}
            </div>
            <p className="text-[var(--muted)] text-sm leading-relaxed flex-1">
              {it.description}
            </p>
            <div className="mt-5 flex items-center gap-2">
              {it.github && (
                <a
                  href={it.github}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="h-9 px-3 rounded-full border border-[color:var(--line-strong)] text-[var(--fg-2)] text-sm hover:bg-[color:var(--hover)] flex items-center gap-1.5"
                >
                  <Github className="w-3.5 h-3.5" /> GitHub
                </a>
              )}
              {it.demo && (
                <a
                  href={it.demo}
                  onClick={(e) => e.stopPropagation()}
                  className="h-9 px-3 rounded-full border border-[color:var(--line-strong)] text-[var(--fg-2)] text-sm hover:bg-[color:var(--hover)] flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Demo
                </a>
              )}
            </div>
          </button>
        ))}
      </section>
    </div>
  );
}

function statusColor(s: string) {
  if (s === "Live") return "bg-[color:var(--accent-soft)] text-[var(--accent)]";
  if (s === "Building") return "bg-amber-400/15 text-amber-500";
  if (s === "Idea") return "bg-[color:var(--surface-2)] text-[var(--fg-2)]";
  return "bg-[color:var(--surface-2)] text-[var(--muted)]";
}

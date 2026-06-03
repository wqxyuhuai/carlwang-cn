import { useState } from "react";
import { workCategories } from "../data";
import { useContent } from "../contentStore";

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
      <section className="content-shell pt-20 pb-10 max-md:pt-10 max-md:pb-6">
        <h1 className="text-[var(--fg)] text-4xl font-semibold tracking-tight max-md:text-3xl">
          Work
        </h1>
      </section>

      <section className="sticky top-[76px] z-30 max-md:top-[112px]">
        <div className="absolute left-0 right-0 top-0 bottom-0 pointer-events-none frosted-bar border-b border-[color:var(--line-soft)]" />
        <div className="content-shell relative flex items-center gap-2 overflow-x-auto py-4 max-md:py-3">
          {workCategories.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={`h-9 shrink-0 px-4 rounded-full text-sm transition-all ${
                active === c
                  ? "bg-[var(--fg)] text-[var(--app-bg)]"
                  : "border border-[color:var(--line)] text-[var(--fg-2)] hover:bg-[color:var(--hover)] hover:border-[color:var(--line-strong)]"
              }`}
            >
              {c}
            </button>
          ))}
          <span className="ml-auto shrink-0 text-[var(--muted-2)] text-sm max-md:hidden">
            {visible.length} project{visible.length !== 1 && "s"}
          </span>
        </div>
      </section>

      <section className="content-shell py-10 max-md:py-7">
        <div className="grid gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 max-md:gap-y-7">
          {visible.map((p) => (
            <button
              key={p.id}
              onClick={() => openProject(p.id)}
              className="group text-left"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-[color:var(--surface-2)]">
                {p.coverImage ? (
                  <img
                    src={p.coverImage}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                ) : null}
              </div>
              <div className="pt-3">
                <div className="text-[var(--fg)] text-base font-semibold tracking-tight line-clamp-2 group-hover:underline">
                  {p.title}
                </div>
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

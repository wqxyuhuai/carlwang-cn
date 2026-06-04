import { useEffect, useMemo, useState } from "react";
import { workCategories } from "../data";
import { useContent } from "../contentStore";
import { sortByDisplayOrder } from "../contentOrdering";
import { ContentCard } from "./ContentCard";

export function Work({ openProject }: { openProject: (id: string) => void }) {
  const { content } = useContent();
  const [active, setActive] = useState("All");
  const publicWork = sortByDisplayOrder(
    content.projects.filter((project) => project.status === "Published"),
  );
  const filters = useMemo(
    () => [
      "All",
      ...workCategories
        .filter((c) => c !== "All")
        .filter((c) => publicWork.some((project) => project.category === c)),
    ],
    [publicWork],
  );
  useEffect(() => {
    if (!filters.includes(active)) setActive("All");
  }, [active, filters]);
  const visible =
    active === "All"
      ? publicWork
      : publicWork.filter((w) => w.category === active);

  return (
    <div>
      <section className="sticky top-[76px] z-30 max-md:top-[112px]">
        <div className="absolute bottom-0 left-0 right-0 top-0 pointer-events-none frosted-bar" />
        <div className="content-shell relative flex items-center gap-2 overflow-x-auto py-5 max-md:py-3">
          {filters.map((c) => (
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
            <ContentCard
              key={p.id}
              onClick={() => openProject(p.id)}
              title={p.title}
              coverImage={p.coverImage}
            />
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

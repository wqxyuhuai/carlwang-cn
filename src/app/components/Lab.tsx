import { useEffect, useMemo, useState } from "react";
import { labCategories } from "../data";
import { useContent } from "../contentStore";
import { sortByDisplayOrder } from "../contentOrdering";
import { ContentCard } from "./ContentCard";

export function Lab({ openLab }: { openLab: (id: string) => void }) {
  const { content } = useContent();
  const [active, setActive] = useState("All");
  const publicLabItems = sortByDisplayOrder(
    content.labItems.filter((item) => !item.hidden),
  );
  const filters = useMemo(
    () => [
      "All",
      ...labCategories
        .filter((c) => c !== "All")
        .filter((c) => publicLabItems.some((item) => item.type === c)),
    ],
    [publicLabItems],
  );
  useEffect(() => {
    if (!filters.includes(active)) setActive("All");
  }, [active, filters]);
  const visible =
    active === "All"
      ? publicLabItems
      : publicLabItems.filter((l) => l.type === active);

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
        </div>
      </section>

      <section className="content-shell py-10 max-md:py-7">
        <div className="grid gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 max-md:gap-y-7">
          {visible.map((it) => (
            <ContentCard
              key={it.id}
              onClick={() => openLab(it.id)}
              title={it.title}
              coverImage={it.coverImage}
            />
          ))}
        </div>
        {visible.length === 0 && (
          <div className="py-24 text-center text-[var(--muted-2)]">
            Nothing in this category yet. Try another filter.
          </div>
        )}
      </section>
    </div>
  );
}

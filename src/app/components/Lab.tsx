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
      <section className="tab-glass-region sticky top-11 z-30 py-5 max-md:top-[96px] max-md:py-3">
        <div className="tab-glass-layer" />
        <div className="tab-controls content-shell flex items-center gap-2.5 overflow-x-auto">
          {filters.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={`h-9 shrink-0 rounded-full px-4 text-sm transition-all duration-300 ${
                active === c
                  ? "bg-[var(--fg)] text-[var(--app-bg)]"
                  : "tab-pill text-[var(--fg-2)] hover:text-[var(--fg)]"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      <section className="content-shell py-9 max-md:py-7">
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

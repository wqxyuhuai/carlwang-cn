import type { LabItem } from "../data";
import { ContentCard } from "./ContentCard";

export function Lab({
  items,
  openLab,
}: {
  items: LabItem[];
  openLab: (id: string) => void;
}) {
  return (
    <div className="cw-page cw-page-with-secondary">
      <section className="content-shell py-9 max-md:py-7">
        <div className="grid gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 max-md:gap-y-7">
          {items.map((it) => (
            <ContentCard
              key={it.id}
              onClick={() => openLab(it.id)}
              title={it.title}
              coverImage={it.coverImage}
            />
          ))}
        </div>
        {items.length === 0 && (
          <div className="py-24 text-center text-[var(--muted-2)]">
            Nothing in this category yet. Try another filter.
          </div>
        )}
      </section>
    </div>
  );
}

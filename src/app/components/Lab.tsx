import { useState } from "react";
import { labCategories } from "../data";
import { useContent } from "../contentStore";
import { CoverArt } from "./CoverArt";

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
      <section className="mx-auto max-w-[1680px] px-8 pt-20 pb-10">
        <h1 className="text-[var(--fg)] text-4xl font-semibold tracking-tight">
          Lab
        </h1>
      </section>

      <section className="sticky top-[76px] z-30">
        <div className="absolute left-0 right-0 top-0 bottom-0 pointer-events-none frosted-bar border-b border-[color:var(--line-soft)]" />
        <div className="relative mx-auto max-w-[1680px] px-8 py-4 flex items-center gap-2 flex-wrap">
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

      <section className="mx-auto max-w-[1680px] px-8 py-10 grid gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {visible.map((it, index) => (
          <button
            key={it.id}
            onClick={() => openLab(it.id)}
            className="group text-left"
          >
            <div className="aspect-[4/3] rounded-md bg-[color:var(--surface-2)] relative overflow-hidden">
              {it.coverImage ? (
                <img
                  src={it.coverImage}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              ) : (
                <CoverArt index={index + 4} />
              )}
            </div>
            <div className="pt-3 text-[var(--fg)] text-base font-semibold tracking-tight line-clamp-2 group-hover:underline">
              {it.title}
            </div>
          </button>
        ))}
      </section>
    </div>
  );
}

import { useState } from "react";
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
      <section className="content-shell pt-20 pb-10 max-md:pt-10 max-md:pb-6">
        <h1 className="text-[var(--fg)] text-4xl font-semibold tracking-tight max-md:text-3xl">
          Lab
        </h1>
      </section>

      <section className="sticky top-[76px] z-30 max-md:top-[112px]">
        <div className="absolute left-0 right-0 top-0 bottom-0 pointer-events-none frosted-bar border-b border-[color:var(--line-soft)]" />
        <div className="content-shell relative flex items-center gap-2 overflow-x-auto py-4 max-md:py-3">
          {labCategories.map((c) => (
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

      <section className="content-shell py-10 grid gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3 max-md:py-7 max-md:gap-y-7">
        {visible.map((it) => (
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
              ) : null}
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

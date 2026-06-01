import { ArrowLeft, Github, ExternalLink } from "lucide-react";
import type { Route } from "../App";
import { useContent } from "../contentStore";
import type { RichBlock } from "../data";

export function LabDetail({ id, go }: { id: string; go: (r: Route) => void }) {
  const { content } = useContent();
  const labItems = content.labItems.filter((entry) => !entry.hidden);
  const item = labItems.find((l) => l.id === id) ?? labItems[0];

  if (!item) {
    return <div className="px-10 py-24 text-[var(--muted)]">Lab item not found.</div>;
  }

  const blocks =
    item.richContent?.length
      ? item.richContent
      : textToRichBlocks(item.content || item.description);

  return (
    <div>
      <section className="mx-auto max-w-[1680px] px-8 pt-10">
        <button
          onClick={() => go("lab")}
          className="text-[var(--muted)] hover:text-[var(--fg)] text-sm flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Lab
        </button>
      </section>

      <section className="mx-auto max-w-[960px] px-8 pt-14 pb-12 text-center">
        <h1 className="text-[var(--fg)] text-5xl font-semibold tracking-tight leading-tight">
          {item.title}
        </h1>
        <p className="text-[var(--fg-2)] text-lg leading-relaxed mt-5">
          {item.description}
        </p>
        <div className="flex justify-center gap-3 mt-7">
          {item.demo && (
            <a
              href={item.demo}
              className="h-12 px-6 rounded-full bg-[var(--fg)] text-[var(--app-bg)] flex items-center gap-2 hover:opacity-90"
            >
              <ExternalLink className="w-4 h-4" /> Open Demo
            </a>
          )}
          {item.github && (
            <a
              href={item.github}
              target="_blank"
              rel="noreferrer"
              className="h-12 px-6 rounded-full border border-[color:var(--line-strong)] text-[var(--fg)] flex items-center gap-2 hover:bg-[color:var(--hover)]"
            >
              <Github className="w-4 h-4" /> View GitHub
            </a>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-8">
        <div className="aspect-[16/9] media-rounded relative">
          {item.coverImage ? (
            <img src={item.coverImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <>
              <div
                className="absolute inset-0 opacity-50"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.06) 1px,transparent 1px)",
                  backgroundSize: "40px 40px",
                }}
              />
              <div className="absolute inset-10 grid grid-cols-7 gap-2">
                {Array.from({ length: 35 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-md border border-[color:var(--line)]"
                    style={{
                      background: `rgba(182,207,116,${0.08 + (i % 7) * 0.05})`,
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-8 py-16">
        <div className="space-y-8">
          <RichContentView blocks={blocks} />
          {item.techStack && (
            <div className="pt-4 flex flex-wrap gap-2">
              {item.techStack.split(",").map((tech) => (
                <span key={tech} className="px-3 py-1.5 rounded-full bg-[color:var(--hover)] text-[var(--fg-2)] text-sm">
                  {tech.trim()}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-8 py-16">
        <button
          onClick={() => go("lab")}
          className="h-11 px-5 rounded-full border border-[color:var(--line-strong)] text-[var(--fg)] hover:bg-[color:var(--hover)]"
        >
          Back to Lab
        </button>
      </section>
    </div>
  );
}

function textToRichBlocks(value: string): RichBlock[] {
  return value
    .split(/\n+/)
    .filter(Boolean)
    .map((paragraph, index) => ({
      id: `paragraph-${index}`,
      type: "text",
      value: paragraph,
      align: "left",
      size: "md",
      width: "wide",
    }));
}

function RichContentView({ blocks }: { blocks: RichBlock[] }) {
  return (
    <div>
      {blocks.map((block) => {
        const align = block.align === "center" ? "text-center mx-auto" : block.align === "right" ? "text-right ml-auto" : "text-left";
        const width = block.width === "half" ? "max-w-[520px]" : block.width === "wide" ? "max-w-[860px]" : "w-full";
        const size =
          block.size === "xl"
            ? "text-5xl"
            : block.size === "lg"
              ? "text-3xl"
              : block.size === "sm"
                ? "text-base"
                : "text-xl";
        const style = {
          color: block.color,
          fontFamily: block.fontFamily,
          fontWeight: block.weight === "bold" ? 700 : block.weight === "medium" ? 500 : 400,
          fontStyle: block.italic ? "italic" : undefined,
          textDecoration: block.underline ? "underline" : undefined,
          lineHeight: 1.75,
        };

        if (!block.value) return null;
        if (block.type === "image") {
          return (
            <img
              key={block.id}
              src={block.value}
              alt=""
              className={`${width} ${align} object-cover`}
            />
          );
        }
        if (block.type === "video") {
          return (
            <video
              key={block.id}
              src={block.value}
              controls
              className={`${width} ${align} aspect-video object-cover`}
            />
          );
        }
        return (
          <p
            key={block.id}
            className={`${width} ${align} ${size} whitespace-pre-wrap`}
            style={style}
          >
            {block.value}
          </p>
        );
      })}
    </div>
  );
}

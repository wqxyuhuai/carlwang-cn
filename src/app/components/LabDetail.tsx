import { ArrowLeft, Github, ExternalLink } from "lucide-react";
import type { Route } from "../App";
import { useContent } from "../contentStore";
import type { RichBlock } from "../data";

export function LabDetail({ id, go }: { id: string; go: (r: Route) => void }) {
  const { content } = useContent();
  const labItems = content.labItems.filter((entry) => !entry.hidden);
  const item = labItems.find((l) => l.id === id) ?? labItems[0];

  if (!item) {
    return <div className="content-shell py-24 text-[var(--muted)]">Lab item not found.</div>;
  }

  const blocks =
    item.richContent?.length
      ? item.richContent
      : textToRichBlocks(item.content || "");

  return (
    <div>
      <section className="content-shell pt-10">
        <button
          onClick={() => go("lab")}
          className="text-[var(--muted)] hover:text-[var(--fg)] text-sm flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Lab
        </button>
      </section>

      <section className="content-shell pt-14 pb-12 text-center">
        <h1 className="text-[var(--fg)] text-5xl font-semibold tracking-tight leading-tight">
          {item.title}
        </h1>
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

      <section className="content-shell py-12">
        <RichContentView blocks={blocks} />
      </section>

      <section className="content-shell py-16">
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
    <div className="space-y-8">
      {blocks.map((block) => {
        const align = block.align === "center" ? "text-center mx-auto" : block.align === "right" ? "text-right ml-auto" : "text-left";
        const width = block.width === "half" ? "max-w-[520px]" : block.width === "wide" ? "max-w-[860px]" : "w-full";
        const size =
          block.size === "xl"
            ? "text-3xl"
            : block.size === "lg"
              ? "text-2xl"
              : block.size === "sm"
                ? "text-sm"
                : "text-base";
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
              className={`${width} ${align} object-cover media-rounded`}
            />
          );
        }
        if (block.type === "video") {
          return (
            <video
              key={block.id}
              src={block.value}
              controls
              className={`${width} ${align} aspect-video object-cover media-rounded`}
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

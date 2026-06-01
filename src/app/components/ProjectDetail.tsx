import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import type { Route } from "../App";
import { useContent } from "../contentStore";
import type { RichBlock } from "../data";

export function ProjectDetail({
  id,
  go,
  openProject,
}: {
  id: string;
  go: (r: Route) => void;
  openProject: (id: string) => void;
}) {
  const { content } = useContent();
  const allWork = content.projects
    .filter((project) => project.status === "Published")
    .sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999));
  const idx = Math.max(0, allWork.findIndex((p) => p.id === id));
  const project = allWork[idx] ?? allWork[0];

  if (!project) {
    return <div className="px-10 py-24 text-[var(--muted)]">Project not found.</div>;
  }

  const prev = allWork[(idx - 1 + allWork.length) % allWork.length];
  const next = allWork[(idx + 1) % allWork.length];
  const blocks =
    project.richContent?.length
      ? project.richContent
      : textToRichBlocks(project.content || project.description);

  return (
    <div>
      <section className="mx-auto max-w-[1680px] px-8 pt-10">
        <button
          onClick={() => go("work")}
          className="text-[var(--muted)] hover:text-[var(--fg)] text-sm flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Work
        </button>
      </section>

      <section className="mx-auto max-w-[960px] px-8 pt-14 pb-12 text-center">
        <h1 className="text-[var(--fg)] text-5xl font-semibold tracking-tight leading-tight">
          {project.title}
        </h1>
        <p className="text-[var(--fg-2)] text-lg leading-relaxed mt-5">
          {project.description}
        </p>
        {project.externalUrl && (
          <a
            href={project.externalUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-7 h-11 px-5 rounded-full bg-[var(--fg)] text-[var(--app-bg)] inline-flex items-center gap-2"
          >
            Open Project <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </section>

      <section className="mx-auto max-w-[1180px] px-8 py-16">
        <RichContentView blocks={blocks} />
      </section>

      {(project.videoUrl || project.galleryImages?.length) && (
        <section className="mx-auto max-w-[1440px] px-8 py-8">
          <div className="grid grid-cols-12 gap-4">
            {project.videoUrl && (
              <video
                src={project.videoUrl}
                controls
                className="col-span-12 w-full aspect-video object-cover media-rounded"
              />
            )}
            {project.galleryImages?.map((image, imageIndex) => (
              <img
                key={`${image}-${imageIndex}`}
                src={image}
                alt=""
                className={`${imageIndex % 3 === 0 ? "col-span-8" : "col-span-4"} aspect-[4/3] object-cover media-rounded`}
              />
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-[1440px] px-8 py-12 flex items-center justify-between">
        <button onClick={() => openProject(prev.id)} className="group text-left">
          <div className="text-[var(--muted-2)] text-xs tracking-[0.2em] uppercase mb-1 flex items-center gap-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Previous
          </div>
          <div className="text-[var(--fg)] text-xl group-hover:text-[var(--accent)] transition-colors">
            {prev.title}
          </div>
        </button>
        <button
          onClick={() => go("work")}
          className="h-11 px-5 rounded-full border border-[color:var(--line-strong)] text-[var(--fg)] hover:bg-[color:var(--hover)]"
        >
          Back to Work
        </button>
        <button onClick={() => openProject(next.id)} className="group text-right">
          <div className="text-[var(--muted-2)] text-xs tracking-[0.2em] uppercase mb-1 flex items-center justify-end gap-2">
            Next <ArrowRight className="w-3.5 h-3.5" />
          </div>
          <div className="text-[var(--fg)] text-xl group-hover:text-[var(--accent)] transition-colors">
            {next.title}
          </div>
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

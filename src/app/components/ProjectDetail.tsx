import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import type { Route } from "../App";
import { useContent } from "../contentStore";
import type { RichBlock } from "../data";
import { CoverArt } from "./CoverArt";

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
      <section className="mx-auto max-w-[1440px] px-10 pt-12">
        <button
          onClick={() => go("work")}
          className="text-[var(--muted)] hover:text-[var(--fg)] text-sm flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Work / {project.title}
        </button>
      </section>

      <section className="mx-auto max-w-[1440px] px-10 pt-12 pb-16">
        <div className="grid grid-cols-12 gap-10 items-start">
          <div className="col-span-7">
            <div className="text-[var(--muted-2)] text-xs tracking-[0.2em] uppercase mb-6">
              {project.category}
            </div>
            <h1
              className="display text-[var(--fg)]"
              style={{ fontSize: 96, lineHeight: 0.96 }}
            >
              {project.title}
            </h1>
            <p className="text-[var(--fg-2)] text-xl leading-relaxed mt-8 max-w-2xl">
              {project.description}
            </p>
            {project.externalUrl && (
              <a
                href={project.externalUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-8 h-11 px-5 rounded-full bg-[var(--fg)] text-[var(--app-bg)] inline-flex items-center gap-2"
              >
                Open Project <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
          <aside className="col-span-5 rounded-2xl border border-[color:var(--line)] p-6 bg-[color:var(--surface)]">
            <dl className="space-y-3 text-sm">
              <Row k="Category" v={project.category} />
              <Row k="Role" v={project.role} />
            </dl>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-10">
        <div className="relative aspect-[16/8] media-rounded">
          {project.coverImage ? (
            <img src={project.coverImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <CoverArt index={idx} />
          )}
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-10 py-20 grid grid-cols-12 gap-10">
        <div className="col-span-5 text-[var(--muted-2)] text-xs tracking-[0.2em] uppercase">
          Project Story
        </div>
        <div className="col-span-7">
          <RichContentView blocks={blocks} />
        </div>
      </section>

      {(project.videoUrl || project.galleryImages?.length) && (
        <section className="mx-auto max-w-[1440px] px-10 py-8">
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

      <section className="mx-auto max-w-[1440px] px-10 py-12 flex items-center justify-between">
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
    <div className="space-y-8">
      {blocks.map((block) => {
        const align = block.align === "center" ? "text-center mx-auto" : block.align === "right" ? "text-right ml-auto" : "text-left";
        const width = block.width === "half" ? "max-w-[520px]" : block.width === "wide" ? "max-w-[780px]" : "w-full";
        const size =
          block.size === "xl"
            ? "text-4xl"
            : block.size === "lg"
              ? "text-2xl"
              : block.size === "sm"
                ? "text-base"
                : "text-lg";

        if (!block.value) return null;
        if (block.type === "image") {
          return (
            <img
              key={block.id}
              src={block.value}
              alt=""
              className={`${width} ${align} media-rounded object-cover`}
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
            className={`${width} ${align} ${size} text-[var(--fg-2)] leading-relaxed`}
          >
            {block.value}
          </p>
        );
      })}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-[color:var(--line-soft)] pb-3 last:border-0">
      <dt className="text-[var(--muted-2)]">{k}</dt>
      <dd className="text-[var(--fg)] text-right">{v}</dd>
    </div>
  );
}

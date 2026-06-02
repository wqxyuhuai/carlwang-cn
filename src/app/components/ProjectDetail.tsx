import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import type { Route } from "../App";
import { useContent } from "../contentStore";
import {
  ProjectContentRenderer,
  textToProjectBlocks,
} from "./ProjectContentRenderer";

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
    return <div className="content-shell py-24 text-[var(--muted)]">Project not found.</div>;
  }

  const prev = allWork[(idx - 1 + allWork.length) % allWork.length];
  const next = allWork[(idx + 1) % allWork.length];
  const blocks =
    project.richContent?.length
      ? project.richContent
      : textToProjectBlocks(project.content || "");

  return (
    <div>
      <section className="content-shell pt-10">
        <button
          onClick={() => go("work")}
          className="text-[var(--muted)] hover:text-[var(--fg)] text-sm flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Work
        </button>
      </section>

      <section className="content-shell pt-14 pb-12 text-center">
        <h1 className="text-[var(--fg)] text-5xl font-semibold tracking-tight leading-tight">
          {project.title}
        </h1>
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

      <section className="content-shell py-12">
        <ProjectContentRenderer blocks={blocks} />
      </section>

      <section className="content-shell py-12 flex items-center justify-between">
        {allWork.length > 1 ? (
        <button onClick={() => openProject(prev.id)} className="group text-left">
          <div className="text-[var(--muted-2)] text-xs tracking-[0.2em] uppercase mb-1 flex items-center gap-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Previous
          </div>
          <div className="text-[var(--fg)] text-xl group-hover:text-[var(--accent)] transition-colors">
            {prev.title}
          </div>
        </button>
        ) : <span />}
        <button
          onClick={() => go("work")}
          className="h-11 px-5 rounded-full border border-[color:var(--line-strong)] text-[var(--fg)] hover:bg-[color:var(--hover)]"
        >
          Back to Work
        </button>
        {allWork.length > 1 ? (
        <button onClick={() => openProject(next.id)} className="group text-right">
          <div className="text-[var(--muted-2)] text-xs tracking-[0.2em] uppercase mb-1 flex items-center justify-end gap-2">
            Next <ArrowRight className="w-3.5 h-3.5" />
          </div>
          <div className="text-[var(--fg)] text-xl group-hover:text-[var(--accent)] transition-colors">
            {next.title}
          </div>
        </button>
        ) : <span />}
      </section>
    </div>
  );
}

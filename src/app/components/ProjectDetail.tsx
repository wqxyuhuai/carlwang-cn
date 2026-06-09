import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";
import OpenInNewRounded from "@mui/icons-material/OpenInNewRounded";
import type { Route } from "../App";
import { useContent } from "../contentStore";
import { sortByDisplayOrder } from "../contentOrdering";
import {
  ProjectContentRenderer,
  textToProjectBlocks,
} from "./ProjectContentRenderer";
import { DetailFloatingBar } from "./DetailFloatingBar";

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
  const allWork = sortByDisplayOrder(
    content.projects.filter((project) => project.status === "Published"),
  );
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
      <section className="content-shell pt-36 max-md:pt-28">
        <button
          onClick={() => go("work")}
          className="text-[var(--muted)] hover:text-[var(--fg)] text-sm flex items-center gap-2"
        >
          <ArrowBackRounded className="w-4 h-4" /> Work
        </button>
      </section>

      <section className="content-shell pt-12 pb-12 text-center max-md:pt-8 max-md:pb-7">
        <h1 className="text-[var(--fg)] text-5xl font-semibold tracking-tight leading-tight max-md:text-3xl">
          {project.title}
        </h1>
        {project.externalUrl && (
          <a
            href={project.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-7 h-11 px-5 rounded-full bg-[var(--fg)] text-[var(--app-bg)] inline-flex items-center gap-2"
          >
            Open Project <OpenInNewRounded className="w-4 h-4" />
          </a>
        )}
      </section>

      <section className="content-shell project-detail-shell py-12 max-md:py-6">
        <ProjectContentRenderer blocks={blocks} fullWidth />
      </section>

      <DetailFloatingBar item={project} routeKey={`project:${project.id}`} />

      <section className="content-shell py-12 flex items-center justify-between gap-4 max-md:grid max-md:grid-cols-2 max-md:py-8">
        {allWork.length > 1 ? (
        <button onClick={() => openProject(prev.id)} className="group min-w-0 text-left">
          <div className="text-[var(--muted-2)] text-xs tracking-normal uppercase mb-1 flex items-center gap-2">
            <ArrowBackRounded className="w-3.5 h-3.5" /> Previous
          </div>
          <div className="line-clamp-2 text-[var(--fg)] text-xl group-hover:text-[var(--accent)] transition-colors max-md:text-base">
            {prev.title}
          </div>
        </button>
        ) : <span />}
        <button
          onClick={() => go("work")}
          className="h-11 px-5 rounded-full border border-[color:var(--line-strong)] text-[var(--fg)] hover:bg-[color:var(--hover)] max-md:col-span-2 max-md:row-start-2"
        >
          Back to Work
        </button>
        {allWork.length > 1 ? (
        <button onClick={() => openProject(next.id)} className="group min-w-0 text-right">
          <div className="text-[var(--muted-2)] text-xs tracking-normal uppercase mb-1 flex items-center justify-end gap-2">
            Next <ArrowForwardRounded className="w-3.5 h-3.5" />
          </div>
          <div className="line-clamp-2 text-[var(--fg)] text-xl group-hover:text-[var(--accent)] transition-colors max-md:text-base">
            {next.title}
          </div>
        </button>
        ) : <span />}
      </section>
    </div>
  );
}

import type { Project } from "../data";
import { ContentCard } from "./ContentCard";

export function Work({
  projects,
  openProject,
}: {
  projects: Project[];
  openProject: (id: string) => void;
}) {
  return (
    <div className="cw-page cw-page-with-secondary">
      <section className="content-shell py-9 max-md:py-7">
        <div className="grid gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 max-md:gap-y-7">
          {projects.map((p) => (
            <ContentCard
              key={p.id}
              onClick={() => openProject(p.id)}
              title={p.title}
              coverImage={p.coverImage}
            />
          ))}
        </div>
        {projects.length === 0 && (
          <div className="text-[var(--muted-2)] text-center py-24">
            Nothing in this category yet. Try another filter.
          </div>
        )}
      </section>
    </div>
  );
}

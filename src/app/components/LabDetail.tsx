import { ArrowLeft, Github, ExternalLink } from "lucide-react";
import type { Route } from "../App";
import { useContent } from "../contentStore";
import { NotionContentView, textToRichBlocks } from "./NotionContent";

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
        <NotionContentView blocks={blocks} />
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

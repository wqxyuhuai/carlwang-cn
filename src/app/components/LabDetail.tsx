import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import GitHub from "@mui/icons-material/GitHub";
import OpenInNewRounded from "@mui/icons-material/OpenInNewRounded";
import type { Route } from "../App";
import { useContent } from "../contentStore";
import { sortByDisplayOrder } from "../contentOrdering";
import { NotionContentView, textToRichBlocks } from "./NotionContent";

export function LabDetail({ id, go }: { id: string; go: (r: Route) => void }) {
  const { content } = useContent();
  const labItems = sortByDisplayOrder(content.labItems.filter((entry) => !entry.hidden));
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
      <section className="content-shell pt-36 max-md:pt-28">
        <button
          onClick={() => go("lab")}
          className="text-[var(--muted)] hover:text-[var(--fg)] text-sm flex items-center gap-2"
        >
          <ArrowBackRounded className="w-4 h-4" /> Lab
        </button>
      </section>

      <section className="content-shell pt-12 pb-12 text-center max-md:pt-8 max-md:pb-7">
        <h1 className="text-[var(--fg)] text-5xl font-semibold tracking-tight leading-tight max-md:text-3xl">
          {item.title}
        </h1>
        <div className="flex justify-center gap-3 mt-7 max-md:flex-col">
          {item.demo && (
            <a
              href={item.demo}
              target="_blank"
              rel="noopener noreferrer"
              className="h-12 px-6 rounded-full bg-[var(--fg)] text-[var(--app-bg)] flex items-center justify-center gap-2 hover:opacity-90"
            >
              <OpenInNewRounded className="w-4 h-4" /> Open Demo
            </a>
          )}
          {item.github && (
            <a
              href={item.github}
              target="_blank"
              rel="noopener noreferrer"
              className="h-12 px-6 rounded-full border border-[color:var(--line-strong)] text-[var(--fg)] flex items-center justify-center gap-2 hover:bg-[color:var(--hover)]"
            >
              <GitHub className="w-4 h-4" /> View GitHub
            </a>
          )}
        </div>
      </section>

      <section className="content-shell project-detail-shell py-12 max-md:py-6">
        <NotionContentView blocks={blocks} fullWidth />
      </section>

      <section className="content-shell py-16 max-md:py-8">
        <button
          onClick={() => go("lab")}
          className="h-11 px-5 rounded-full border border-[color:var(--line-strong)] text-[var(--fg)] hover:bg-[color:var(--hover)] max-md:w-full"
        >
          Back to Lab
        </button>
      </section>
    </div>
  );
}

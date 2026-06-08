import type { CSSProperties } from "react";
import OpenInNewRounded from "@mui/icons-material/OpenInNewRounded";
import type { ProjectBlock } from "../data";

export function textToProjectBlocks(value: string): ProjectBlock[] {
  return value
    .split(/\n+/)
    .filter(Boolean)
    .map((text, index) => ({
      id: `paragraph-${index}`,
      type: "paragraph",
      value: text,
      text,
      width: "wide",
    }));
}

export function ProjectContentRenderer({
  blocks,
  fullWidth = false,
}: {
  blocks: ProjectBlock[];
  fullWidth?: boolean;
}) {
  return (
    <div className={fullWidth ? "project-content project-content--full" : "project-content"}>
      {renderBlocks(blocks, fullWidth)}
    </div>
  );
}

function renderBlocks(blocks: ProjectBlock[] = [], fullWidth = false) {
  return blocks.map((block, index) => (
    <ProjectBlockView
      key={block.id || `${block.type}-${index}`}
      block={block}
      fullWidth={fullWidth}
    />
  ));
}

function ProjectBlockView({
  block,
  fullWidth,
}: {
  block: ProjectBlock;
  fullWidth: boolean;
}) {
  const text = block.text ?? block.value ?? "";

  if (block.type === "columns" || block.type === "column_list") {
    const columns =
      block.columns ||
      (block.children || []).map((column) => column.children || []);
    const count = Math.min(Math.max(columns.length || 2, 2), 3);
    return (
      <div
        className={`${blockWidth(block, fullWidth)} ${blockAlign(block, fullWidth)} my-6 grid gap-4 md:gap-5 ${
          count === 3 ? "md:grid-cols-3" : "md:grid-cols-2"
        }`}
      >
        {columns.slice(0, 3).map((items, index) => (
          <div key={`${block.id}-column-${index}`} className="min-w-0 space-y-3">
            {renderBlocks(items, fullWidth)}
          </div>
        ))}
      </div>
    );
  }

  if (block.type === "gallery-grid") {
    const items = block.children || [];
    return (
      <div className={`${blockWidth(block, fullWidth)} ${blockAlign(block, fullWidth)} my-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3`}>
        {items.map((item) => (
          <ProjectBlockView key={item.id} block={{ ...item, width: "full" }} fullWidth={fullWidth} />
        ))}
      </div>
    );
  }

  if (block.type === "divider") {
    return <hr className={`${blockWidth(block, fullWidth)} ${blockAlign(block, fullWidth)} my-10 border-[color:var(--line)]`} />;
  }

  if (block.type === "image") {
    if (!block.value) return null;
    return (
      <figure className={`${blockWidth(block, fullWidth)} ${blockAlign(block, fullWidth)} my-5`}>
        <img
          src={block.value}
          alt={block.caption || ""}
          draggable={false}
          className="aspect-auto w-full rounded-lg border border-[color:var(--line)] object-contain protected-media"
        />
        {block.caption && (
          <figcaption className="mt-3 text-center text-sm text-[var(--muted-2)]">
            {block.caption}
          </figcaption>
        )}
      </figure>
    );
  }

  if (block.type === "video") {
    if (!block.value) return null;
    return (
      <figure className={`${blockWidth(block, fullWidth)} ${blockAlign(block, fullWidth)} my-5`}>
        <video
          src={block.value}
          controls
          controlsList="nodownload noplaybackrate noremoteplayback"
          disablePictureInPicture
          draggable={false}
          className="aspect-video w-full rounded-lg border border-[color:var(--line)] object-contain protected-media"
        />
        {block.caption && (
          <figcaption className="mt-3 text-center text-sm text-[var(--muted-2)]">
            {block.caption}
          </figcaption>
        )}
      </figure>
    );
  }

  if (block.type === "embed" || block.type === "bookmark") {
    const href = block.url || block.value;
    if (!href) return null;
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className={`${blockWidth(block, fullWidth)} ${blockAlign(block, fullWidth)} my-5 flex items-center justify-between gap-4 rounded-xl border border-[color:var(--line)] bg-[color:var(--surface)] px-5 py-4 text-[var(--fg)] transition-colors hover:border-[color:var(--accent)]/50`}
      >
        <span className="min-w-0 truncate">{text || href}</span>
        <OpenInNewRounded className="h-4 w-4 shrink-0 text-[var(--muted-2)]" />
      </a>
    );
  }

  if (block.type === "table") {
    return (
      <div className={`${blockWidth(block, fullWidth)} ${blockAlign(block, fullWidth)} my-8 overflow-x-auto rounded-xl border border-[color:var(--line)]`}>
        <table className="w-full border-collapse text-left text-sm">
          <tbody>
            {(block.rows || []).map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b border-[color:var(--line-soft)] last:border-b-0">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="border-r border-[color:var(--line-soft)] px-4 py-3 last:border-r-0">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (block.type === "code") {
    return (
      <pre className={`${blockWidth(block, fullWidth)} ${blockAlign(block, fullWidth)} my-6 overflow-x-auto rounded-xl border border-[color:var(--line)] bg-[#111] px-5 py-4 text-sm leading-7 text-white`}>
        {block.language && (
          <div className="mb-3 text-xs uppercase tracking-normal text-white/45">
            {block.language}
          </div>
        )}
        <code>{text}</code>
      </pre>
    );
  }

  if (block.type === "list" || block.type === "bulleted_list_item" || block.type === "numbered_list_item") {
    const items =
      block.items?.length
        ? block.items
        : text
          ? [text]
          : [];
    const Tag = block.ordered || block.type === "numbered_list_item" ? "ol" : "ul";
    return (
      <Tag className={`${blockWidth(block, fullWidth)} ${blockAlign(block, fullWidth)} my-4 list-inside space-y-2 text-base leading-7 text-[var(--fg)] ${Tag === "ol" ? "list-decimal" : "list-disc"}`}>
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </Tag>
    );
  }

  if (block.type === "quote") {
    return (
      <blockquote className={`${blockWidth(block, fullWidth)} ${blockAlign(block, fullWidth)} my-6 border-l-2 border-[color:var(--fg)] pl-5 text-xl leading-8 text-[var(--fg)]`}>
        {text}
      </blockquote>
    );
  }

  if (block.type === "callout") {
    return (
      <div className={`${blockWidth(block, fullWidth)} ${blockAlign(block, fullWidth)} my-5 flex gap-3 rounded-xl border border-[color:var(--line)] bg-[color:var(--surface)] px-5 py-4`}>
        <span className="mt-0.5 text-lg">{block.icon || "i"}</span>
        <p className="min-w-0 whitespace-pre-wrap text-base leading-7 text-[var(--fg)]">{text}</p>
      </div>
    );
  }

  if (block.type === "fallback") {
    return (
      <div className={`${blockWidth(block, fullWidth)} ${blockAlign(block, fullWidth)} my-4 rounded-xl border border-dashed border-[color:var(--line)] px-4 py-3 text-sm text-[var(--muted)]`}>
        Unsupported block: {text || "This content type is not available yet."}
      </div>
    );
  }

  const tag = headingLevel(block);
  const className = `${blockWidth(block, fullWidth)} ${blockAlign(block, fullWidth)} whitespace-pre-wrap ${textClass(block)}`;
  const style = textStyle(block);
  if (tag === "h2") return <h2 className={className} style={style}>{text}</h2>;
  if (tag === "h3") return <h3 className={className} style={style}>{text}</h3>;
  if (tag === "h4") return <h4 className={className} style={style}>{text}</h4>;
  return <p className={className} style={style}>{text}</p>;
}

function headingLevel(block: ProjectBlock): "h2" | "h3" | "h4" | "p" {
  if (block.type === "heading" && block.level === 1) return "h2";
  if (block.type === "heading" && block.level === 2) return "h3";
  if (block.type === "heading" && block.level === 3) return "h4";
  if (block.type === "heading_1") return "h2";
  if (block.type === "heading_2") return "h3";
  if (block.type === "heading_3") return "h4";
  return "p";
}

function blockAlign(block: ProjectBlock, fullWidth = false) {
  if (fullWidth) return "text-left";
  if (block.align === "center") return "mx-auto text-center";
  if (block.align === "right") return "ml-auto text-right";
  return "text-left";
}

function blockWidth(block: ProjectBlock, fullWidth = false) {
  if (fullWidth) return "w-full max-w-full";
  if (block.width === "half") return "max-w-[520px] max-md:max-w-full";
  if (block.width === "full") return "w-full";
  return "max-w-[860px] max-md:max-w-full";
}

function textClass(block: ProjectBlock) {
  const tag = headingLevel(block);
  if (tag === "h2") return "my-10 text-4xl font-semibold leading-tight tracking-tight text-[var(--fg)] max-md:my-7 max-md:text-3xl";
  if (tag === "h3") return "my-8 text-3xl font-semibold leading-tight tracking-tight text-[var(--fg)] max-md:my-6 max-md:text-2xl";
  if (tag === "h4") return "my-7 text-2xl font-semibold leading-snug text-[var(--fg)] max-md:my-5 max-md:text-xl";
  return "my-4 text-base leading-8 text-[var(--fg)] max-md:leading-7";
}

function textStyle(block: ProjectBlock): CSSProperties {
  return {
    color: block.color,
    fontFamily: block.fontFamily,
    fontWeight: block.weight === "bold" ? 700 : block.weight === "medium" ? 500 : undefined,
    fontStyle: block.italic ? "italic" : undefined,
    textDecoration: block.underline ? "underline" : undefined,
  };
}

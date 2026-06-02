import type { CSSProperties } from "react";
import { ExternalLink } from "lucide-react";
import type { RichBlock } from "../data";

export function textToRichBlocks(value: string): RichBlock[] {
  return value
    .split(/\n+/)
    .filter(Boolean)
    .map((paragraph, index) => ({
      id: `paragraph-${index}`,
      type: "paragraph",
      value: paragraph,
      align: "left",
      size: "md",
      width: "wide",
    }));
}

export function NotionContentView({ blocks }: { blocks: RichBlock[] }) {
  return <div className="notion-content">{renderBlocks(blocks)}</div>;
}

function renderBlocks(blocks: RichBlock[] = []) {
  let numberedIndex = 0;
  return blocks.map((block, index) => {
    if (block.type === "numbered_list_item") {
      numberedIndex += 1;
    } else {
      numberedIndex = 0;
    }
    return (
      <NotionBlock
        key={block.id || `${block.type}-${index}`}
        block={block}
        listIndex={numberedIndex || undefined}
      />
    );
  });
}

function NotionBlock({ block, listIndex }: { block: RichBlock; listIndex?: number }) {
  if (block.type === "divider") {
    return <hr className="my-10 border-[color:var(--line)]" />;
  }

  if (!block.value && block.type !== "callout") return null;

  if (block.type === "image") {
    return (
      <figure className={`${blockWidth(block)} ${blockAlign(block)} my-8`}>
        <img
          src={block.value}
          alt={block.caption || ""}
          draggable={false}
          className="w-full object-cover media-rounded protected-media"
        />
        {block.caption && <figcaption className="mt-3 text-center text-sm text-[var(--muted-2)]">{block.caption}</figcaption>}
      </figure>
    );
  }

  if (block.type === "video") {
    return (
      <figure className={`${blockWidth(block)} ${blockAlign(block)} my-8`}>
        <video
          src={block.value}
          controls
          controlsList="nodownload noplaybackrate noremoteplayback"
          disablePictureInPicture
          draggable={false}
          className="aspect-video w-full object-cover media-rounded protected-media"
        />
        {block.caption && <figcaption className="mt-3 text-center text-sm text-[var(--muted-2)]">{block.caption}</figcaption>}
      </figure>
    );
  }

  if (block.type === "bookmark" || block.type === "embed") {
    const href = block.url || block.value;
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className={`${blockWidth(block)} ${blockAlign(block)} my-5 flex items-center justify-between gap-4 rounded-xl border border-[color:var(--line)] bg-[color:var(--surface)] px-5 py-4 text-[var(--fg)] transition-colors hover:border-[color:var(--accent)]/50`}
      >
        <span className="min-w-0 truncate">{block.value || href}</span>
        <ExternalLink className="h-4 w-4 shrink-0 text-[var(--muted-2)]" />
      </a>
    );
  }

  if (block.type === "code") {
    return (
      <pre className={`${blockWidth(block)} ${blockAlign(block)} my-6 overflow-x-auto rounded-xl border border-[color:var(--line)] bg-[#111] px-5 py-4 text-sm leading-7 text-white`}>
        {block.language && <div className="mb-3 text-xs uppercase tracking-[0.16em] text-white/45">{block.language}</div>}
        <code>{block.value}</code>
      </pre>
    );
  }

  if (block.type === "callout") {
    return (
      <div className={`${blockWidth(block)} ${blockAlign(block)} my-5 flex gap-3 rounded-xl border border-[color:var(--line)] bg-[color:var(--surface)] px-5 py-4`}>
        <span className="mt-0.5 text-lg">{block.icon || "i"}</span>
        <div className="min-w-0">
          <p className="whitespace-pre-wrap text-base leading-7 text-[var(--fg)]">{block.value}</p>
          <NestedBlocks blocks={block.children} />
        </div>
      </div>
    );
  }

  if (block.type === "quote") {
    return (
      <blockquote className={`${blockWidth(block)} ${blockAlign(block)} my-6 border-l-2 border-[color:var(--fg)] pl-5 text-xl leading-8 text-[var(--fg)]`}>
        {block.value}
        <NestedBlocks blocks={block.children} />
      </blockquote>
    );
  }

  if (block.type === "bulleted_list_item" || block.type === "numbered_list_item") {
    return (
      <div className={`${blockWidth(block)} ${blockAlign(block)} my-2 flex gap-3 text-base leading-7 text-[var(--fg)]`}>
        <span className="w-5 shrink-0 text-[var(--muted)]">{block.type === "numbered_list_item" ? `${listIndex || 1}.` : "-"}</span>
        <div className="min-w-0">
          <p className="whitespace-pre-wrap">{block.value}</p>
          <NestedBlocks blocks={block.children} />
        </div>
      </div>
    );
  }

  const Tag = headingTag(block);
  const className = `${blockWidth(block)} ${blockAlign(block)} whitespace-pre-wrap ${textClass(block)}`;
  return (
    <Tag className={className} style={textStyle(block)}>
      {block.value}
      <NestedBlocks blocks={block.children} />
    </Tag>
  );
}

function NestedBlocks({ blocks }: { blocks?: RichBlock[] }) {
  if (!blocks?.length) return null;
  return <div className="mt-3 space-y-2">{renderBlocks(blocks)}</div>;
}

function headingTag(block: RichBlock): "h2" | "h3" | "h4" | "p" {
  if (block.type === "heading_1") return "h2";
  if (block.type === "heading_2") return "h3";
  if (block.type === "heading_3") return "h4";
  return "p";
}

function blockAlign(block: RichBlock) {
  if (block.align === "center") return "mx-auto text-center";
  if (block.align === "right") return "ml-auto text-right";
  return "text-left";
}

function blockWidth(block: RichBlock) {
  if (block.width === "half") return "max-w-[520px]";
  if (block.width === "full") return "w-full";
  return "max-w-[860px]";
}

function textClass(block: RichBlock) {
  if (block.type === "heading_1") return "my-10 text-4xl font-semibold leading-tight tracking-tight text-[var(--fg)]";
  if (block.type === "heading_2") return "my-8 text-3xl font-semibold leading-tight tracking-tight text-[var(--fg)]";
  if (block.type === "heading_3") return "my-7 text-2xl font-semibold leading-snug text-[var(--fg)]";
  const size =
    block.size === "xl"
      ? "text-3xl"
      : block.size === "lg"
        ? "text-2xl"
        : block.size === "sm"
          ? "text-sm"
          : "text-base";
  return `my-4 ${size} leading-8 text-[var(--fg)]`;
}

function textStyle(block: RichBlock): CSSProperties {
  return {
    color: block.color,
    fontFamily: block.fontFamily,
    fontWeight: block.weight === "bold" ? 700 : block.weight === "medium" ? 500 : undefined,
    fontStyle: block.italic ? "italic" : undefined,
    textDecoration: block.underline ? "underline" : undefined,
  };
}

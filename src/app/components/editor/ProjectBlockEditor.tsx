import { useEffect, useRef, useState, type CSSProperties, type DragEvent } from "react";
import { AlignCenter, AlignLeft, AlignRight, GripVertical, Image as ImageIcon, Plus, Trash2, Upload, Video } from "lucide-react";
import type { ProjectBlock } from "../../data";
import { useContent } from "../../contentStore";
import { canUploadToOss, uploadToOss } from "../../ossUpload";
import { ProjectContentRenderer } from "../ProjectContentRenderer";

type Command = {
  type: ProjectBlock["type"];
  label: string;
  description: string;
};

const commands: Command[] = [
  { type: "paragraph", label: "Text", description: "Plain paragraph" },
  { type: "heading", label: "Heading", description: "Section title" },
  { type: "image", label: "Image", description: "Upload image" },
  { type: "video", label: "Video", description: "Upload video" },
  { type: "quote", label: "Quote", description: "Pull quote" },
  { type: "callout", label: "Callout", description: "Highlighted note" },
  { type: "divider", label: "Divider", description: "Horizontal rule" },
  { type: "list", label: "List", description: "Bullet list" },
  { type: "table", label: "Table", description: "Simple table" },
  { type: "embed", label: "Embed / link", description: "External URL" },
  { type: "columns", label: "Columns", description: "Two or three columns" },
  { type: "gallery-grid", label: "Gallery grid", description: "Image grid" },
];

function uid() {
  return `block-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function createBlock(type: ProjectBlock["type"]): ProjectBlock {
  if (type === "heading") return { id: uid(), type, value: "", text: "", level: 2, width: "wide" };
  if (type === "image" || type === "video") return { id: uid(), type, value: "", caption: "", width: "wide" };
  if (type === "quote") return { id: uid(), type, value: "", text: "", width: "wide" };
  if (type === "callout") return { id: uid(), type, value: "", text: "", icon: "i", width: "wide" };
  if (type === "divider") return { id: uid(), type, value: "", width: "wide" };
  if (type === "list") return { id: uid(), type, value: "", items: [""], ordered: false, width: "wide" };
  if (type === "table") return { id: uid(), type, value: "", rows: [["", ""], ["", ""]], width: "wide" };
  if (type === "embed") return { id: uid(), type, value: "", text: "", url: "", width: "wide" };
  if (type === "columns") {
    return {
      id: uid(),
      type,
      value: "",
      width: "wide",
      columns: [[createBlock("paragraph")], [createBlock("paragraph")]],
    };
  }
  if (type === "gallery-grid") {
    return { id: uid(), type, value: "", width: "wide", children: [createBlock("image"), createBlock("image")] };
  }
  return { id: uid(), type: "paragraph", value: "", text: "", width: "wide" };
}

function normalizeBlocks(blocks: ProjectBlock[]) {
  return blocks.length ? blocks : [createBlock("paragraph")];
}

function isTextLikeBlock(block: ProjectBlock) {
  return block.type === "paragraph" || block.type === "heading" || block.type === "quote" || block.type === "callout";
}

export function ProjectBlockEditor({
  blocks,
  uploadPathPrefix,
  onChange,
}: {
  blocks: ProjectBlock[];
  uploadPathPrefix: string;
  onChange: (blocks: ProjectBlock[]) => void;
}) {
  const value = normalizeBlocks(blocks);
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [menuIndex, setMenuIndex] = useState<number | null>(null);
  const [slashMenu, setSlashMenu] = useState<null | { blockId: string; query: string }>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);
  const [pendingFocusId, setPendingFocusId] = useState<string | null>(null);
  const [selectionToolbar, setSelectionToolbar] = useState<null | { top: number; left: number; blockId: string }>(null);
  const editableRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!pendingFocusId) return;
    window.requestAnimationFrame(() => {
      const element = editableRefs.current[pendingFocusId];
      if (!element) return;
      element.focus();
      const range = document.createRange();
      range.selectNodeContents(element);
      range.collapse(false);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
      setFocusedBlockId(pendingFocusId);
      setPendingFocusId(null);
    });
  }, [pendingFocusId, value]);

  const registerEditable = (id: string, element: HTMLDivElement | null) => {
    editableRefs.current[id] = element;
  };

  const patchBlock = (id: string, patch: Partial<ProjectBlock>) => {
    const patchInBlocks = (blocks: ProjectBlock[]): ProjectBlock[] =>
      blocks.map((block) => {
        if (block.id === id) return { ...block, ...patch };
        if (block.columns?.length) {
          return { ...block, columns: block.columns.map((column) => patchInBlocks(column)) };
        }
        if (block.children?.length) {
          return { ...block, children: patchInBlocks(block.children) };
        }
        return block;
      });
    onChange(patchInBlocks(value));
  };
  const findBlock = (id: string, blocks: ProjectBlock[] = value): ProjectBlock | undefined => {
    for (const block of blocks) {
      if (block.id === id) return block;
      if (block.columns?.length) {
        for (const column of block.columns) {
          const found = findBlock(id, column);
          if (found) return found;
        }
      }
      if (block.children?.length) {
        const found = findBlock(id, block.children);
        if (found) return found;
      }
    }
    return undefined;
  };
  const insertAfter = (index: number, type: ProjectBlock["type"]) => {
    const next = [...value];
    const block = createBlock(type);
    next.splice(index + 1, 0, block);
    setMenuIndex(null);
    if (isTextLikeBlock(block)) setPendingFocusId(block.id);
    onChange(next);
  };
  const appendParagraph = () => {
    const block = createBlock("paragraph");
    onChange([...value, block]);
    setPendingFocusId(block.id);
  };
  const replaceBlock = (id: string, type: ProjectBlock["type"]) => {
    let replacementId: string | null = null;
    const replaceInBlocks = (blocks: ProjectBlock[]): ProjectBlock[] =>
      blocks.map((block) => {
        if (block.id === id) {
          const replacement = createBlock(type);
          const currentText = block.text ?? block.value ?? "";
          if (isTextLikeBlock(replacement)) {
            replacement.text = currentText.replace(/^\/\S*\s?/, "");
            replacement.value = replacement.text;
          }
          replacementId = replacement.id;
          return replacement;
        }
        if (block.columns?.length) {
          return { ...block, columns: block.columns.map((column) => replaceInBlocks(column)) };
        }
        if (block.children?.length) {
          return { ...block, children: replaceInBlocks(block.children) };
        }
        return block;
      });
    onChange(replaceInBlocks(value));
    setSlashMenu(null);
    if (replacementId) setPendingFocusId(replacementId);
  };
  const remove = (id: string) =>
    onChange(value.length > 1 ? value.filter((block) => block.id !== id) : [createBlock("paragraph")]);
  const move = (from: number, to: number) => {
    if (to < 0 || to >= value.length || from === to) return;
    const next = [...value];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };
  const handleDrop = (event: DragEvent<HTMLDivElement>, targetIndex: number) => {
    event.preventDefault();
    const from = Number(event.dataTransfer.getData("text/plain"));
    setDragOverIndex(null);
    if (!Number.isInteger(from) || from < 0 || from >= value.length || from === targetIndex) return;

    const targetElement = event.currentTarget;
    const rect = targetElement.getBoundingClientRect();
    const x = rect.width ? (event.clientX - rect.left) / rect.width : 0.5;
    const dragged = value[from];
    const withoutDragged = value.filter((_, index) => index !== from);
    const adjustedTargetIndex = from < targetIndex ? targetIndex - 1 : targetIndex;
    const target = withoutDragged[adjustedTargetIndex];
    if (!target) return;

    if (target.type === "columns") {
      const columns = target.columns?.length
        ? target.columns.map((column) => [...column])
        : [[createBlock("paragraph")], [createBlock("paragraph")]];
      if (columns.length < 3 && x < 0.14) {
        columns.unshift([dragged]);
      } else if (columns.length < 3 && x > 0.86) {
        columns.push([dragged]);
      } else {
        const columnIndex = Math.min(columns.length - 1, Math.max(0, Math.floor(x * columns.length)));
        columns[columnIndex] = [...(columns[columnIndex] || []), dragged];
      }
      withoutDragged[adjustedTargetIndex] = { ...target, columns };
      onChange(withoutDragged);
      return;
    }

    if (x < 0.3 || x > 0.7) {
      const columns = x < 0.5 ? [[dragged], [target]] : [[target], [dragged]];
      withoutDragged[adjustedTargetIndex] = {
        ...createBlock("columns"),
        columns,
      };
      onChange(withoutDragged);
      return;
    }

    move(from, targetIndex);
  };

  return (
    <div
      className="mx-auto max-w-[900px]"
      onMouseUp={() => {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed || !selection.rangeCount) {
          setSelectionToolbar(null);
          return;
        }
        const rect = selection.getRangeAt(0).getBoundingClientRect();
        if (!rect.width && !rect.height) {
          setSelectionToolbar(null);
          return;
        }
        const node = selection.anchorNode;
        const element = node instanceof Element ? node : node?.parentElement;
        const blockId = element
          ?.closest("[data-editor-block-id]")
          ?.getAttribute("data-editor-block-id");
        if (!blockId) {
          setSelectionToolbar(null);
          return;
        }
        setSelectionToolbar({
          top: rect.top - 42,
          left: rect.left + rect.width / 2,
          blockId,
        });
      }}
    >
      <div className="mb-6 grid grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-2 max-md:grid-cols-[28px_minmax(0,1fr)_auto]">
        <div className="col-start-2 min-w-0">
          <div className="text-sm font-medium text-[var(--fg)]">Project content</div>
        </div>
        <div className="col-start-3 rounded-full border border-[color:var(--line)] bg-[var(--app-bg)] p-1">
          {(["edit", "preview"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setMode(item)}
              className={`h-8 rounded-full px-3 text-xs ${
                mode === item ? "bg-[var(--fg)] text-[var(--app-bg)]" : "text-[var(--muted)]"
              }`}
            >
              {item === "edit" ? "Edit" : "Preview"}
            </button>
          ))}
        </div>
      </div>

      {mode === "preview" ? (
        <div className="px-2 py-4">
          <ProjectContentRenderer blocks={value} />
        </div>
      ) : (
        <div className="relative px-2 py-4 max-md:px-0">
          {selectionToolbar && (
            <FloatingToolbar
              top={selectionToolbar.top}
              left={selectionToolbar.left}
              block={findBlock(selectionToolbar.blockId)}
              onFormat={(format) => {
                const block = findBlock(selectionToolbar.blockId);
                if (!block) return;
                if (format === "bold") {
                  patchBlock(block.id, {
                    weight: block.weight === "bold" ? "normal" : "bold",
                  });
                }
                if (format === "italic") patchBlock(block.id, { italic: !block.italic });
                if (format === "underline") patchBlock(block.id, { underline: !block.underline });
              }}
              onColor={(color) => patchBlock(selectionToolbar.blockId, { color })}
              onAlign={(align) => patchBlock(selectionToolbar.blockId, { align })}
              onClose={() => setSelectionToolbar(null)}
            />
          )}
          {value.map((block, index) => (
            <div
              key={block.id}
              onDragOver={(event) => {
                event.preventDefault();
                setDragOverIndex(index);
              }}
              onDragLeave={() => setDragOverIndex(null)}
              onDrop={(event) => handleDrop(event, index)}
              className={`group relative -mx-12 grid grid-cols-[40px_minmax(0,1fr)_32px] gap-2 rounded-lg px-2 py-0.5 transition-colors max-md:mx-0 max-md:grid-cols-[28px_minmax(0,1fr)_28px] max-md:gap-1 max-md:px-0 ${
                dragOverIndex === index ? "bg-[color:var(--accent-soft)]" : "hover:bg-black/[0.015]"
              }`}
            >
              <div className="relative flex justify-end gap-1 pt-2 opacity-0 transition-opacity duration-150 group-hover:opacity-100 max-md:opacity-60">
                <button
                  type="button"
                  onClick={() => setMenuIndex(menuIndex === index ? null : index)}
                  className="grid h-7 w-7 place-items-center rounded-md text-[var(--muted-2)] hover:bg-[color:var(--surface-2)] hover:text-[var(--fg)] max-md:h-6 max-md:w-6"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <div
                  draggable
                  onDragStart={(event) => {
                    event.dataTransfer.setData("text/plain", String(index));
                    event.dataTransfer.effectAllowed = "move";
                  }}
                  className="grid h-7 w-5 cursor-grab place-items-center text-[var(--muted-2)] max-md:hidden"
                >
                  <GripVertical className="h-4 w-4" />
                </div>
                {menuIndex === index && <InsertMenu onPick={(type) => insertAfter(index, type)} />}
              </div>
              <div className="min-w-0">
                <BlockView
                  block={block}
                  uploadPathPrefix={uploadPathPrefix}
                  onChange={(patch) => patchBlock(block.id, patch)}
                  onEnter={() => insertAfter(index, "paragraph")}
                  onDelete={() => remove(block.id)}
                  focusedBlockId={focusedBlockId}
                  onFocusBlock={setFocusedBlockId}
                  onRequestFocus={setPendingFocusId}
                  registerEditable={registerEditable}
                  slashMenu={slashMenu}
                  onSlashMenu={setSlashMenu}
                  onReplaceBlock={replaceBlock}
                />
              </div>
              <button
                type="button"
                onClick={() => remove(block.id)}
                className="mt-1 grid h-7 w-7 place-items-center rounded-md text-[var(--muted-2)] opacity-0 transition-opacity hover:bg-rose-500/10 hover:text-rose-500 group-hover:opacity-100 max-md:h-6 max-md:w-6"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={appendParagraph}
            className="ml-[42px] mt-3 block min-h-28 w-[calc(100%-42px)] rounded-lg px-2 text-left text-sm text-transparent transition-colors hover:bg-black/[0.015] hover:text-[var(--muted-3)] focus:text-[var(--muted-3)] focus:outline-none max-md:ml-[29px] max-md:w-[calc(100%-29px)]"
          >
            Click to continue writing
          </button>
        </div>
      )}
    </div>
  );
}

function BlockView({
  block,
  uploadPathPrefix,
  onChange,
  onEnter,
  onDelete,
  focusedBlockId,
  onFocusBlock,
  onRequestFocus,
  registerEditable,
  slashMenu,
  onSlashMenu,
  onReplaceBlock,
}: {
  block: ProjectBlock;
  uploadPathPrefix: string;
  onChange: (patch: Partial<ProjectBlock>) => void;
  onEnter: () => void;
  onDelete: () => void;
  focusedBlockId: string | null;
  onFocusBlock: (id: string | null) => void;
  onRequestFocus: (id: string) => void;
  registerEditable: (id: string, element: HTMLDivElement | null) => void;
  slashMenu: null | { blockId: string; query: string };
  onSlashMenu: (state: null | { blockId: string; query: string }) => void;
  onReplaceBlock: (id: string, type: ProjectBlock["type"]) => void;
}) {
  if (block.type === "heading" || block.type === "paragraph" || block.type === "quote" || block.type === "callout") {
    return (
      <EditableText
        block={block}
        className={editorTextClass(block)}
        style={editorTextStyle(block)}
        onChange={(text) => onChange({ text, value: text })}
        onEnter={onEnter}
        onEmptyBackspace={onDelete}
        focused={focusedBlockId === block.id}
        onFocus={() => onFocusBlock(block.id)}
        onBlurEmpty={() => onFocusBlock(null)}
        registerEditable={registerEditable}
        slashMenu={slashMenu}
        onSlashMenu={onSlashMenu}
        onReplaceBlock={onReplaceBlock}
      />
    );
  }

  if (block.type === "image" || block.type === "video") {
    return (
      <MediaEditor
        block={block}
        uploadPathPrefix={uploadPathPrefix}
        onChange={onChange}
      />
    );
  }

  if (block.type === "divider") {
    return <hr className="my-8 border-[color:var(--line)]" />;
  }

  if (block.type === "list") {
    return (
      <textarea
        value={(block.items || [""]).join("\n")}
        onChange={(event) => onChange({ items: event.target.value.split(/\n/), value: event.target.value })}
        className="my-2 min-h-20 w-full resize-y rounded-lg border border-transparent bg-transparent px-0 py-2 text-base leading-7 text-[var(--fg)] outline-none placeholder:text-[var(--muted-3)] focus:border-[color:var(--line-soft)] focus:px-3"
        placeholder="One list item per line"
      />
    );
  }

  if (block.type === "table") {
    return (
      <textarea
        value={(block.rows || [["", ""]]).map((row) => row.join(" | ")).join("\n")}
        onChange={(event) =>
          onChange({
            rows: event.target.value.split(/\n/).map((row) => row.split("|").map((cell) => cell.trim())),
          })
        }
        className="my-2 min-h-28 w-full resize-y rounded-xl border border-[color:var(--line-soft)] bg-transparent px-4 py-3 font-mono text-sm leading-7 text-[var(--fg)] outline-none focus:border-[color:var(--line)]"
        placeholder={"Cell A | Cell B\nCell C | Cell D"}
      />
    );
  }

  if (block.type === "embed") {
    return (
      <input
        value={block.url || block.value}
        onChange={(event) => onChange({ url: event.target.value, value: event.target.value, text: event.target.value })}
        className="my-2 h-11 w-full rounded-xl border border-[color:var(--line-soft)] bg-transparent px-4 text-sm text-[var(--fg)] outline-none focus:border-[color:var(--line)]"
        placeholder="Paste a URL"
      />
    );
  }

  if (block.type === "columns") {
    const columns = block.columns?.length ? block.columns : [[createBlock("paragraph")], [createBlock("paragraph")]];
    const setColumnCount = (count: 2 | 3) => {
      const next = columns.slice(0, count);
      while (next.length < count) next.push([createBlock("paragraph")]);
      onChange({ columns: next });
    };
    const updateColumnChild = (columnIndex: number, childId: string, patch: Partial<ProjectBlock>) => {
      const next = columns.map((items, index) =>
        index === columnIndex
          ? items.map((item) => (item.id === childId ? { ...item, ...patch } : item))
          : items,
      );
      onChange({ columns: next });
    };
    const insertColumnChildAfter = (columnIndex: number, childIndex: number) => {
      const nextBlock = createBlock("paragraph");
      const next = columns.map((items, index) => {
        if (index !== columnIndex) return items;
        const copy = [...items];
        copy.splice(childIndex + 1, 0, nextBlock);
        return copy;
      });
      onChange({ columns: next });
      onRequestFocus(nextBlock.id);
    };
    const removeColumnChild = (columnIndex: number, childId: string) => {
      const next = columns.map((items, index) => {
        if (index !== columnIndex) return items;
        const filtered = items.filter((item) => item.id !== childId);
        return filtered.length ? filtered : [createBlock("paragraph")];
      });
      onChange({ columns: next });
    };
    return (
      <div className="my-4">
        <div className="mb-2 flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          {[2, 3].map((count) => (
            <button
              key={count}
              type="button"
              onClick={() => setColumnCount(count as 2 | 3)}
              className={`h-7 rounded-full px-2 text-xs ${
                columns.length === count
                  ? "bg-[var(--fg)] text-[var(--app-bg)]"
                  : "border border-[color:var(--line)] text-[var(--muted)]"
              }`}
            >
              {count} cols
            </button>
          ))}
        </div>
        <div className={`group/columns grid gap-3 rounded-lg border border-dashed border-transparent p-2 transition-colors group-hover:border-[color:var(--line-soft)] ${columns.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
          {columns.slice(0, 3).map((column, columnIndex) => (
            <div key={columnIndex} className="min-w-0 px-2 py-1">
              {column.map((child, childIndex) => (
                <BlockView
                  key={child.id}
                  block={child}
                  uploadPathPrefix={uploadPathPrefix}
                  onChange={(patch) => updateColumnChild(columnIndex, child.id, patch)}
                  onEnter={() => insertColumnChildAfter(columnIndex, childIndex)}
                  onDelete={() => removeColumnChild(columnIndex, child.id)}
                  focusedBlockId={focusedBlockId}
                  onFocusBlock={onFocusBlock}
                  onRequestFocus={onRequestFocus}
                  registerEditable={registerEditable}
                  slashMenu={slashMenu}
                  onSlashMenu={onSlashMenu}
                  onReplaceBlock={onReplaceBlock}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (block.type === "gallery-grid") {
    return (
      <div className="my-5 grid gap-4 sm:grid-cols-2">
        {(block.children || []).map((child) => (
          <MediaEditor
            key={child.id}
            block={child}
            uploadPathPrefix={uploadPathPrefix}
            onChange={(patch) =>
              onChange({
                children: (block.children || []).map((item) =>
                  item.id === child.id ? { ...item, ...patch } : item,
                ),
              })
            }
          />
        ))}
      </div>
    );
  }

  return <div className="my-3 rounded-xl border border-dashed border-[color:var(--line)] px-4 py-3 text-sm text-[var(--muted)]">Unsupported block</div>;
}

function EditableText({
  block,
  className,
  style,
  onChange,
  onEnter,
  onEmptyBackspace,
  focused,
  onFocus,
  onBlurEmpty,
  registerEditable,
  slashMenu,
  onSlashMenu,
  onReplaceBlock,
}: {
  block: ProjectBlock;
  className: string;
  style?: CSSProperties;
  onChange: (text: string) => void;
  onEnter: () => void;
  onEmptyBackspace: () => void;
  focused?: boolean;
  onFocus?: () => void;
  onBlurEmpty?: () => void;
  registerEditable?: (id: string, element: HTMLDivElement | null) => void;
  slashMenu?: null | { blockId: string; query: string };
  onSlashMenu?: (state: null | { blockId: string; query: string }) => void;
  onReplaceBlock?: (id: string, type: ProjectBlock["type"]) => void;
}) {
  const text = block.text ?? block.value ?? "";
  const activeSlashMenu = slashMenu?.blockId === block.id ? slashMenu : null;
  const slashItems = activeSlashMenu ? filterCommands(activeSlashMenu.query) : [];
  return (
    <div className="relative">
      <div
        contentEditable
        suppressContentEditableWarning
        ref={(element) => registerEditable?.(block.id, element)}
        data-editor-block-id={block.id}
        data-placeholder={focused ? "Type '/' for commands" : ""}
        className={`${className} min-h-[30px] cursor-text whitespace-pre-wrap break-words outline-none empty:before:text-[var(--muted-3)] empty:before:content-[attr(data-placeholder)]`}
        style={style}
        onFocus={onFocus}
        onInput={(event) => {
          const next = event.currentTarget.textContent || "";
          if (next.startsWith("/")) {
            onSlashMenu?.({ blockId: block.id, query: next.slice(1).trim().toLowerCase() });
          } else if (slashMenu?.blockId === block.id) {
            onSlashMenu?.(null);
          }
        }}
        onBlur={(event) => {
          const next = event.currentTarget.textContent || "";
          onChange(next);
          if (!next.trim()) {
            onEmptyBackspace();
            onBlurEmpty?.();
          }
        }}
        onKeyDown={(event) => {
          const currentText = event.currentTarget.textContent || "";
          if (event.key === "/" && !currentText) {
            onSlashMenu?.({ blockId: block.id, query: "" });
          }
          if (event.key === "Escape" && activeSlashMenu) {
            event.preventDefault();
            onSlashMenu?.(null);
            return;
          }
          if (event.key === "Enter" && activeSlashMenu && slashItems[0]) {
            event.preventDefault();
            onReplaceBlock?.(block.id, slashItems[0].type);
            return;
          }
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            onChange(currentText);
            onEnter();
          }
          if (event.key === "Backspace" && !currentText) {
            event.preventDefault();
            onEmptyBackspace();
          }
        }}
      >
        {text}
      </div>
      {activeSlashMenu && (
        <SlashCommandMenu
          items={slashItems}
          onPick={(type) => onReplaceBlock?.(block.id, type)}
        />
      )}
    </div>
  );
}

function MediaEditor({
  block,
  uploadPathPrefix,
  onChange,
}: {
  block: ProjectBlock;
  uploadPathPrefix: string;
  onChange: (patch: Partial<ProjectBlock>) => void;
}) {
  const { content } = useContent();
  const accept = block.type === "video" ? "video/*" : "image/*";
  const uploadFile = async (file: File) => {
    if (canUploadToOss(content.settings.oss)) {
      return uploadToOss(file, content.settings.oss, uploadPathPrefix);
    }
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  };
  return (
    <figure className={`group/media my-3 ${editorBlockWidth(block)}`}>
      {block.value ? (
        <div className="relative">
          {block.type === "video" ? (
            <video src={block.value} controls className="aspect-video w-full rounded-lg border border-[color:var(--line)] object-cover" />
          ) : (
            <img src={block.value} alt="" className="w-full rounded-lg border border-[color:var(--line)] object-cover" />
          )}
          <label className="absolute right-3 top-3 inline-flex h-9 cursor-pointer items-center gap-2 rounded-full bg-black/70 px-3 text-xs text-white opacity-0 backdrop-blur transition-opacity group-hover/media:opacity-100">
            <Upload className="h-3.5 w-3.5" />
            Replace
            <input
              type="file"
              accept={accept}
              className="hidden"
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                onChange({ value: await uploadFile(file) });
              }}
            />
          </label>
        </div>
      ) : (
        <label className="flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-[color:var(--line-strong)] bg-[color:var(--surface)] px-5 py-7 text-center text-sm text-[var(--muted)] hover:border-[color:var(--accent)]/60">
          <Upload className="mb-3 h-5 w-5" />
          {block.type === "video" ? "Upload video" : "Upload image"}
          <input
            type="file"
            accept={accept}
            className="hidden"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              onChange({ value: await uploadFile(file) });
            }}
          />
        </label>
      )}
      <input
        value={block.caption || ""}
        onChange={(event) => onChange({ caption: event.target.value })}
        className={`mt-2 h-8 w-full bg-transparent text-center text-xs text-[var(--muted-2)] outline-none transition-opacity placeholder:text-[var(--muted-3)] ${
          block.caption ? "opacity-100" : "opacity-0 focus:opacity-100 group-hover/media:opacity-70"
        }`}
        placeholder="Add caption"
      />
      <div className="mt-1 flex justify-center gap-1 opacity-0 transition-opacity group-hover/media:opacity-100">
        {(["half", "wide", "full"] as const).map((width) => (
          <button
            key={width}
            type="button"
            onClick={() => onChange({ width })}
            className={`h-7 rounded-full px-2 text-xs ${
              (block.width || "wide") === width
                ? "bg-[var(--fg)] text-[var(--app-bg)]"
                : "border border-[color:var(--line)] text-[var(--muted)]"
            }`}
          >
            {width === "half" ? "Half" : width === "full" ? "Full" : "Wide"}
          </button>
        ))}
      </div>
    </figure>
  );
}

function filterCommands(query: string) {
  if (!query) return commands;
  return commands.filter((command) => {
    const haystack = `${command.type} ${command.label} ${command.description}`.toLowerCase();
    return haystack.includes(query);
  });
}

function SlashCommandMenu({
  items,
  onPick,
}: {
  items: Command[];
  onPick: (type: ProjectBlock["type"]) => void;
}) {
  return (
    <div className="absolute left-0 top-full z-40 mt-1 w-[300px] max-w-[calc(100vw-32px)] overflow-hidden rounded-xl border border-[color:var(--line)] bg-[var(--surface)] py-1 shadow-xl backdrop-blur">
      {items.length ? (
        items.map((command) => (
          <button
            key={command.type}
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onPick(command.type)}
            className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-[color:var(--hover)]"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[color:var(--surface-2)] text-xs text-[var(--fg)]">
              {commandIcon(command.type)}
            </span>
            <span className="min-w-0">
              <span className="block text-sm text-[var(--fg)]">{command.label}</span>
              <span className="block text-xs text-[var(--muted-2)]">{command.description}</span>
            </span>
          </button>
        ))
      ) : (
        <div className="px-3 py-2 text-sm text-[var(--muted)]">No matching block</div>
      )}
    </div>
  );
}

function InsertMenu({ onPick }: { onPick: (type: ProjectBlock["type"]) => void }) {
  return (
    <div className="absolute left-8 top-8 z-30 w-[280px] max-w-[calc(100vw-32px)] overflow-hidden rounded-xl border border-[color:var(--line)] bg-[var(--surface)] py-1 shadow-xl backdrop-blur max-md:left-0">
      {commands.map((command) => (
        <button
          key={command.type}
          type="button"
          onClick={() => onPick(command.type)}
          className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-[color:var(--hover)]"
        >
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[color:var(--surface-2)] text-[var(--muted)]">
            {command.type === "image" ? <ImageIcon className="h-4 w-4" /> : command.type === "video" ? <Video className="h-4 w-4" /> : commandIcon(command.type)}
          </span>
          <span>
            <span className="block text-sm text-[var(--fg)]">{command.label}</span>
            <span className="block text-xs text-[var(--muted-2)]">{command.description}</span>
          </span>
        </button>
      ))}
    </div>
  );
}

function commandIcon(type: ProjectBlock["type"]) {
  if (type === "heading") return "H";
  if (type === "quote") return "\"";
  if (type === "callout") return "i";
  if (type === "divider") return "--";
  if (type === "list") return "-";
  if (type === "table") return "tbl";
  if (type === "embed") return "url";
  if (type === "columns") return "col";
  if (type === "gallery-grid") return "grid";
  if (type === "image") return "img";
  if (type === "video") return "vid";
  return "T";
}

function FloatingToolbar({
  top,
  left,
  block,
  onFormat,
  onColor,
  onAlign,
  onClose,
}: {
  top: number;
  left: number;
  block?: ProjectBlock;
  onFormat: (format: "bold" | "italic" | "underline") => void;
  onColor: (color: string) => void;
  onAlign: (align: ProjectBlock["align"]) => void;
  onClose: () => void;
}) {
  const align = block?.align || "left";
  return (
    <div
      className="fixed z-50 flex -translate-x-1/2 items-center gap-1 rounded-lg bg-[#111] px-1.5 py-1 text-xs text-white shadow-xl"
      style={{ top, left }}
      onMouseDown={(event) => event.preventDefault()}
    >
      {[
        ["B", "bold"],
        ["I", "italic"],
        ["U", "underline"],
      ].map(([item, format]) => (
        <button
          key={item}
          type="button"
          onClick={() => onFormat(format as "bold" | "italic" | "underline")}
          className={`grid h-7 w-7 place-items-center rounded hover:bg-white/12 ${
            item === "I" ? "italic" : item === "U" ? "underline" : "font-semibold"
          }`}
        >
          {item}
        </button>
      ))}
      <span className="mx-0.5 h-5 w-px bg-white/15" />
      <label
        className="relative grid h-7 w-7 cursor-pointer place-items-center rounded hover:bg-white/12"
        title="Text color"
      >
        <span
          className="block h-4 w-4 rounded-full border border-white/35"
          style={{ background: block?.color || "#ffffff" }}
        />
        <input
          type="color"
          value={block?.color || "#111111"}
          onChange={(event) => onColor(event.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </label>
      <span className="mx-0.5 h-5 w-px bg-white/15" />
      {[
        ["left", AlignLeft],
        ["center", AlignCenter],
        ["right", AlignRight],
      ].map(([item, Icon]) => (
        <button
          key={item as string}
          type="button"
          onClick={() => onAlign(item as ProjectBlock["align"])}
          className={`grid h-7 w-7 place-items-center rounded hover:bg-white/12 ${
            align === item ? "bg-white/16 text-white" : "text-white/75"
          }`}
          title={`Align ${item}`}
        >
          <Icon className="h-3.5 w-3.5" />
        </button>
      ))}
      <span className="mx-0.5 h-5 w-px bg-white/15" />
      <button
        type="button"
        onClick={onClose}
        className="grid h-7 w-7 place-items-center rounded text-white/60 hover:bg-white/12 hover:text-white"
      >
        x
      </button>
    </div>
  );
}

function editorTextClass(block: ProjectBlock) {
  if (block.type === "heading" && block.level === 1) return "my-5 text-4xl font-semibold leading-tight text-[var(--fg)]";
  if (block.type === "heading" && block.level === 2) return "my-4 text-3xl font-semibold leading-tight text-[var(--fg)]";
  if (block.type === "heading" && block.level === 3) return "my-3 text-2xl font-semibold leading-snug text-[var(--fg)]";
  if (block.type === "quote") return "my-4 border-l-2 border-[color:var(--fg)] pl-4 text-xl leading-8 text-[var(--fg)]";
  if (block.type === "callout") return "my-3 rounded-xl bg-[color:var(--surface)] px-4 py-3 text-base leading-7 text-[var(--fg)]";
  return "my-2 text-base leading-8 text-[var(--fg)]";
}

function editorBlockWidth(block: ProjectBlock) {
  if (block.width === "half") return "max-w-[520px] max-md:max-w-full";
  if (block.width === "full") return "w-full";
  return "max-w-[860px] max-md:max-w-full";
}

function editorTextStyle(block: ProjectBlock): CSSProperties {
  return {
    color: block.color,
    textAlign: block.align,
    fontWeight: block.weight === "bold" ? 700 : block.weight === "medium" ? 500 : undefined,
    fontStyle: block.italic ? "italic" : undefined,
    textDecoration: block.underline ? "underline" : undefined,
  };
}

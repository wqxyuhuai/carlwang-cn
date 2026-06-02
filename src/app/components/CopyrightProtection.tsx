import { useEffect } from "react";

const ATTRIBUTION = [
  "",
  "",
  "作者：Carl Wang",
  "链接：{url}",
  "著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。",
].join("\n");

export function CopyrightProtection({ disabled = false }: { disabled?: boolean }) {
  useEffect(() => {
    if (disabled) return;

    const isProtectedMedia = (target: EventTarget | null) => {
      if (!(target instanceof Element)) return false;
      return Boolean(target.closest("img, video, picture, figure"));
    };

    const onCopy = (event: ClipboardEvent) => {
      if (isProtectedMedia(event.target)) {
        event.preventDefault();
        return;
      }

      const selection = window.getSelection();
      const selectedText = selection?.toString().trim();
      if (!selectedText || !event.clipboardData) return;

      const url = window.location.href;
      event.preventDefault();
      event.clipboardData.setData(
        "text/plain",
        `${selectedText}${ATTRIBUTION.replace("{url}", url)}`,
      );
    };

    const onContextMenu = (event: MouseEvent) => {
      if (isProtectedMedia(event.target)) event.preventDefault();
    };

    const onDragStart = (event: DragEvent) => {
      if (isProtectedMedia(event.target)) event.preventDefault();
    };

    document.addEventListener("copy", onCopy);
    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("dragstart", onDragStart);

    return () => {
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("dragstart", onDragStart);
    };
  }, [disabled]);

  return null;
}

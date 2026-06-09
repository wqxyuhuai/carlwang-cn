import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import KeyboardArrowUpRounded from "@mui/icons-material/KeyboardArrowUpRounded";
import ThumbUpRounded from "@mui/icons-material/ThumbUpRounded";
import VisibilityRounded from "@mui/icons-material/VisibilityRounded";
import type { LabItem, Project } from "../data";

type DetailItem = Pick<
  Project | LabItem,
  "id" | "title" | "time" | "year" | "coverImage" | "galleryImages" | "views" | "likes"
>;

type DetailFloatingBarProps = {
  item: DetailItem;
  routeKey: string;
};

const VIEW_STORAGE_PREFIX = "cw-detail-views";
const LIKE_STORAGE_PREFIX = "cw-detail-likes";

function parseDate(value?: string) {
  if (!value) return null;
  const date = new Date(value.replace(/\//g, "-"));
  return Number.isNaN(date.getTime()) ? null : date;
}

function relativeTime(time?: string, year?: number) {
  const date = parseDate(time) || (year ? new Date(year, 0, 1) : null);
  if (!date) return "";

  const diffMs = Math.max(0, Date.now() - date.getTime());
  const days = Math.floor(diffMs / 86400000);
  if (days < 1) return "today";
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;

  const years = Math.floor(months / 12);
  return `${years} year${years === 1 ? "" : "s"} ago`;
}

function backgroundIsDark(element: Element) {
  if (element instanceof HTMLImageElement || element instanceof HTMLVideoElement) {
    return true;
  }

  const style = window.getComputedStyle(element);
  const color = style.backgroundColor.match(/rgba?\(([^)]+)\)/);
  if (!color) return null;

  const [r, g, b, rawAlpha] = color[1].split(",").map((part) => Number(part.trim()));
  const alpha = rawAlpha ?? 1;
  if (
    !Number.isFinite(r) ||
    !Number.isFinite(g) ||
    !Number.isFinite(b) ||
    alpha < 0.16
  ) {
    return null;
  }

  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance < 0.42;
}

function sampleBackground(root: HTMLElement | null) {
  if (!root) return false;

  const rect = root.getBoundingClientRect();
  const points = [
    [rect.left + rect.width * 0.25, rect.top + rect.height * 0.5],
    [rect.left + rect.width * 0.5, rect.top + rect.height * 0.5],
    [rect.left + rect.width * 0.75, rect.top + rect.height * 0.5],
  ];

  let darkVotes = 0;
  let votes = 0;

  for (const [x, y] of points) {
    const elements = document.elementsFromPoint(x, y);
    for (const element of elements) {
      if (root.contains(element)) continue;
      const result = backgroundIsDark(element);
      if (result === null) continue;
      votes += 1;
      if (result) darkVotes += 1;
      break;
    }
  }

  if (votes) return darkVotes >= Math.ceil(votes / 2);
  return document.documentElement.dataset.theme === "dark";
}

export function DetailFloatingBar({ item, routeKey }: DetailFloatingBarProps) {
  const dockRef = useRef<HTMLDivElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [onDark, setOnDark] = useState(false);
  const [docked, setDocked] = useState(false);
  const [burst, setBurst] = useState(false);
  const [liked, setLiked] = useState(() => {
    try {
      return localStorage.getItem(`cw-appreciated-${item.id}`) === "true";
    } catch {
      return false;
    }
  });
  const [likes, setLikes] = useState(item.likes ?? 0);
  const [views, setViews] = useState(item.views ?? 0);

  const coverImage = item.coverImage || item.galleryImages?.[0] || "";
  const timeLabel = useMemo(() => relativeTime(item.time, item.year), [item.time, item.year]);

  useEffect(() => {
    const baseViews = item.views ?? 0;
    const baseLikes = item.likes ?? 0;
    try {
      const appreciated = localStorage.getItem(`cw-appreciated-${item.id}`) === "true";
      const storedLikes = Number(localStorage.getItem(`${LIKE_STORAGE_PREFIX}-${item.id}`));
      const storedViews = Number(localStorage.getItem(`${VIEW_STORAGE_PREFIX}-${item.id}`));
      const viewedKey = `${VIEW_STORAGE_PREFIX}-seen-${item.id}`;
      const hasViewed = localStorage.getItem(viewedKey) === "true";
      const nextViews =
        Math.max(baseViews, Number.isFinite(storedViews) ? storedViews : baseViews) +
        (hasViewed ? 0 : 1);

      setLiked(appreciated);
      setLikes(Math.max(baseLikes, Number.isFinite(storedLikes) ? storedLikes : baseLikes));
      setViews(nextViews);
      localStorage.setItem(viewedKey, "true");
      localStorage.setItem(`${VIEW_STORAGE_PREFIX}-${item.id}`, String(nextViews));
    } catch {
      setLiked(false);
      setLikes(baseLikes);
      setViews(baseViews);
    }
  }, [item.id, item.likes, item.views]);

  useEffect(() => {
    let raf = 0;

    const update = () => {
      raf = 0;
      const root = document.documentElement;
      const isLong = root.scrollHeight > window.innerHeight + 120;
      const shouldShow = isLong && window.scrollY > Math.min(280, window.innerHeight * 0.28);
      const dockTop = dockRef.current?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY;
      const floatHeight = rootRef.current?.getBoundingClientRect().height ?? 96;
      const fixedTop = window.innerHeight - floatHeight - 104;
      const shouldDock = shouldShow && dockTop <= fixedTop;

      setVisible(shouldShow);
      setDocked(shouldDock);
      if (shouldShow) setOnDark(sampleBackground(rootRef.current));
    };

    const schedule = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [routeKey]);

  const toggleLike = () => {
    setLiked((current) => {
      const next = !current;
      setLikes((count) => {
        const nextCount = Math.max(0, count + (next ? 1 : -1));
        try {
          localStorage.setItem(`${LIKE_STORAGE_PREFIX}-${item.id}`, String(nextCount));
        } catch {}
        return nextCount;
      });
      try {
        localStorage.setItem(`cw-appreciated-${item.id}`, String(next));
      } catch {}
      if (next) {
        setBurst(true);
        window.setTimeout(() => setBurst(false), 520);
      }
      return next;
    });
  };

  return (
    <div ref={dockRef} className="detail-float-dock">
      <div
        ref={rootRef}
        className={`detail-float ${visible ? "is-visible" : ""} ${onDark ? "is-on-dark" : ""} ${docked ? "is-docked" : ""}`}
        style={{ "--detail-float-bottom": "104px" } as CSSProperties}
      >
        <div className="cw-glass-wrapper detail-float-card">
          <span className="cw-glass-effect" aria-hidden="true" />
          <div className="detail-float-content">
            {coverImage ? (
              <img className="detail-float-cover" src={coverImage} alt="" />
            ) : (
              <div className="detail-float-cover detail-float-cover-placeholder" aria-hidden="true" />
            )}
            <div className="detail-float-copy">
              <div className="detail-float-title">{item.title}</div>
              <div className="detail-float-meta">
                {timeLabel && <span>{timeLabel}</span>}
                <span aria-hidden="true">{"\u00b7"}</span>
                <span className="detail-float-meta-item">
                  <VisibilityRounded />
                  {views}
                </span>
                <span aria-hidden="true">{"\u00b7"}</span>
                <span className="detail-float-meta-item">
                  <ThumbUpRounded />
                  {likes}
                </span>
              </div>
            </div>
            <button
              type="button"
              className={`detail-float-like ${liked ? "is-liked" : ""} ${burst ? "is-bursting" : ""}`}
              onClick={toggleLike}
              aria-pressed={liked}
            >
              <ThumbUpRounded />
              <span>{liked ? "Appreciated" : "Appreciate"}</span>
            </button>
          </div>
        </div>
        <button
          type="button"
          className="cw-glass-wrapper detail-float-top"
          aria-label="Back to top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <span className="cw-glass-effect" aria-hidden="true" />
          <span className="detail-float-top-content">
            <KeyboardArrowUpRounded />
          </span>
        </button>
      </div>
    </div>
  );
}

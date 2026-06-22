export type DetailStatsKind = "project" | "lab";

export type DetailStats = {
  views: number;
  likes: number;
  liked: boolean;
};

type LocalStatsOptions = {
  baseViews: number;
  baseLikes: number;
};

const VIEW_STORAGE_PREFIX = "cw-detail-views";
const LIKE_STORAGE_PREFIX = "cw-detail-likes";
const APPRECIATED_STORAGE_PREFIX = "cw-appreciated";

function normalizeNumber(value: unknown) {
  return Math.max(0, Number(value) || 0);
}

function localKeys(id: string) {
  return {
    liked: `${APPRECIATED_STORAGE_PREFIX}-${id}`,
    likes: `${LIKE_STORAGE_PREFIX}-${id}`,
    views: `${VIEW_STORAGE_PREFIX}-${id}`,
  };
}

export function readLocalDetailStats(
  id: string,
  { baseViews, baseLikes }: LocalStatsOptions,
) {
  const keys = localKeys(id);
  const appreciated = localStorage.getItem(keys.liked) === "true";
  const storedLikes = Number(localStorage.getItem(keys.likes));
  const storedViews = Number(localStorage.getItem(keys.views));
  const nextViews =
    Math.max(baseViews, Number.isFinite(storedViews) ? storedViews : baseViews) + 1;

  localStorage.setItem(keys.views, String(nextViews));

  return {
    liked: appreciated,
    likes: Math.max(baseLikes, Number.isFinite(storedLikes) ? storedLikes : baseLikes),
    views: nextViews,
  };
}

export function writeLocalLike(id: string, liked: boolean, count: number) {
  const keys = localKeys(id);
  localStorage.setItem(keys.liked, String(liked));
  localStorage.setItem(keys.likes, String(Math.max(0, count)));
}

async function requestStats<T>(
  kind: DetailStatsKind,
  id: string,
  action?: "view" | "like",
  init?: RequestInit,
) {
  const path = `/api/stats/${kind}/${encodeURIComponent(id)}${action ? `/${action}` : ""}`;
  const response = await fetch(path, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Stats request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function recordDetailView(kind: DetailStatsKind, id: string) {
  const stats = await requestStats<DetailStats>(kind, id, "view", {
    method: "POST",
    body: "{}",
  });

  return {
    views: normalizeNumber(stats.views),
    likes: normalizeNumber(stats.likes),
    liked: stats.liked === true,
  };
}

export async function setRemoteDetailLike(
  kind: DetailStatsKind,
  id: string,
  liked: boolean,
) {
  const stats = await requestStats<DetailStats>(kind, id, "like", {
    method: "POST",
    body: JSON.stringify({ liked }),
  });

  return {
    views: normalizeNumber(stats.views),
    likes: normalizeNumber(stats.likes),
    liked: stats.liked === true,
  };
}

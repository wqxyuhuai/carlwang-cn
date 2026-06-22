const API_PREFIX = "/api/stats/";
const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: JSON_HEADERS,
  });
}

function sanitizePart(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 96);
}

function getClientIp(request) {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "local"
  );
}

async function sha256(value) {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function getVisitorKey(request, env) {
  const ip = getClientIp(request);
  const userAgent = request.headers.get("user-agent") || "";
  const salt = env.STATS_SALT || "carlwang-cn-stats";
  return sha256(`${salt}:${ip}:${userAgent}`);
}

async function readCounts(kv, key) {
  const value = await kv.get(key, "json");
  return {
    views: Math.max(0, Number(value?.views) || 0),
    likes: Math.max(0, Number(value?.likes) || 0),
  };
}

async function writeCounts(kv, key, counts) {
  await kv.put(
    key,
    JSON.stringify({
      views: Math.max(0, Number(counts.views) || 0),
      likes: Math.max(0, Number(counts.likes) || 0),
      updatedAt: new Date().toISOString(),
    }),
  );
}

async function handleStats(request, env) {
  const kv = env.CW_STATS;
  if (!kv) {
    return json({ error: "CW_STATS KV binding is not configured" }, 503);
  }

  const url = new URL(request.url);
  const parts = url.pathname.slice(API_PREFIX.length).split("/");
  const [kindRaw, idRaw, actionRaw] = parts;
  const kind = sanitizePart(kindRaw);
  const id = sanitizePart(idRaw);
  const action = sanitizePart(actionRaw);

  if (!["project", "lab"].includes(kind) || !id) {
    return json({ error: "Invalid stats target" }, 400);
  }

  const visitorKey = await getVisitorKey(request, env);
  const countKey = `stats:${kind}:${id}:counts`;
  const likeKey = `stats:${kind}:${id}:like:${visitorKey}`;

  if (request.method === "GET") {
    const [counts, liked] = await Promise.all([
      readCounts(kv, countKey),
      kv.get(likeKey),
    ]);
    return json({ ...counts, liked: liked === "1" });
  }

  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const counts = await readCounts(kv, countKey);

  if (action === "view") {
    counts.views += 1;
    await writeCounts(kv, countKey, counts);
    const liked = (await kv.get(likeKey)) === "1";
    return json({ ...counts, liked });
  }

  if (action === "like") {
    let body = {};
    try {
      body = await request.json();
    } catch {}

    const wantLiked = body.liked === true;
    const wasLiked = (await kv.get(likeKey)) === "1";

    if (wantLiked && !wasLiked) {
      counts.likes += 1;
      await Promise.all([writeCounts(kv, countKey, counts), kv.put(likeKey, "1")]);
    } else if (!wantLiked && wasLiked) {
      counts.likes = Math.max(0, counts.likes - 1);
      await Promise.all([writeCounts(kv, countKey, counts), kv.delete(likeKey)]);
    }

    return json({ ...counts, liked: wantLiked });
  }

  return json({ error: "Invalid stats action" }, 400);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith(API_PREFIX)) {
      return handleStats(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};

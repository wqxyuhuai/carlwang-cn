import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const ENV_PATH = path.join(ROOT, ".env.local");
const NOTION_VERSION = "2022-06-28";
const DEFAULT_CONTENT_URL =
  "https://carlwang-cn.oss-cn-shanghai.aliyuncs.com/uploads/site-content.json";
const FETCH_TIMEOUT_MS = Number(process.env.SYNC_FETCH_TIMEOUT_MS || 90000);
const FETCH_RETRIES = Number(process.env.SYNC_FETCH_RETRIES || 3);
const NOTION_CONCURRENCY = Number(process.env.SYNC_NOTION_CONCURRENCY || 3);
const BLOCK_CONCURRENCY = Number(process.env.SYNC_BLOCK_CONCURRENCY || 4);
const MEDIA_CONCURRENCY = Number(process.env.SYNC_MEDIA_CONCURRENCY || 2);
const RETRYABLE_STATUS_CODES = new Set([408, 425, 429, 500, 502, 503, 504]);
const PLACEHOLDER_PROJECT_IDS = new Set([
  "wattdesk",
  "imaster",
  "energy-marketing",
  "motion-series",
  "wattcision",
  "ess-site",
  "bess-brochure",
  "brand-guideline",
  "expo-pack",
]);
const PLACEHOLDER_LAB_IDS = new Set([
  "gh-calendar",
  "gradient-gen",
  "link-toolkit",
  "ios-tips",
  "mini-prog",
  "design-archive",
]);

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`Missing env file: ${filePath}`);
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const match = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    const value = rawValue.replace(/^['"]|['"]$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

function envFlag(name) {
  return ["1", "true", "yes", "on"].includes(
    String(process.env[name] || "").trim().toLowerCase(),
  );
}

function envList(name) {
  return String(process.env[name] || "")
    .split(/[,\s]+/)
    .map((value) => value.trim())
    .filter(Boolean);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function retryDelayMs(attempt, response) {
  const retryAfter = response?.headers?.get("retry-after");
  if (retryAfter) {
    const seconds = Number(retryAfter);
    if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);
  }
  return Math.min(30000, 750 * 2 ** attempt);
}

function createLimiter(max) {
  const limit = Math.max(1, Number(max) || 1);
  let active = 0;
  const queue = [];

  const next = () => {
    if (active >= limit || queue.length === 0) return;
    const { task, resolve, reject } = queue.shift();
    active += 1;
    Promise.resolve()
      .then(task)
      .then(resolve, reject)
      .finally(() => {
        active -= 1;
        next();
      });
  };

  return (task) =>
    new Promise((resolve, reject) => {
      queue.push({ task, resolve, reject });
      next();
    });
}

async function mapWithConcurrency(items, concurrency, mapper) {
  const limit = createLimiter(concurrency);
  return Promise.all(items.map((item, index) => limit(() => mapper(item, index))));
}

const limitNotion = createLimiter(NOTION_CONCURRENCY);
const limitMedia = createLimiter(MEDIA_CONCURRENCY);

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, {
      ...options,
      signal: options.signal || controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchWithRetry(url, options = {}) {
  const { retries: requestedRetries, ...fetchOptions } = options;
  const retries = Number.isFinite(requestedRetries) ? requestedRetries : FETCH_RETRIES;
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetchWithTimeout(url, fetchOptions);
      if (
        response.ok ||
        !RETRYABLE_STATUS_CODES.has(response.status) ||
        attempt === retries
      ) {
        return response;
      }
      await response.text().catch(() => "");
      const delay = retryDelayMs(attempt, response);
      console.log(
        `Retrying ${url} after HTTP ${response.status} in ${Math.round(delay / 1000)}s`,
      );
      await sleep(delay);
    } catch (error) {
      lastError = error;
      if (attempt === retries) throw error;
      const delay = retryDelayMs(attempt);
      console.log(`Retrying ${url} after ${error.message} in ${Math.round(delay / 1000)}s`);
      await sleep(delay);
    }
  }

  throw lastError;
}

function cleanPart(value) {
  return String(value || "").trim().replace(/^\/+|\/+$/g, "");
}

function encodePath(value) {
  return value
    .split("/")
    .filter(Boolean)
    .map((part) => encodeURIComponent(part))
    .join("/");
}

function slugify(value, fallback) {
  const slug = String(value || "")
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return slug || fallback;
}

function extensionFromUrl(url, fallback = "") {
  try {
    const pathname = new URL(url).pathname;
    const ext = path.extname(decodeURIComponent(pathname));
    return ext || fallback;
  } catch {
    return fallback;
  }
}

function extFromContentType(contentType) {
  const type = contentType.split(";")[0]?.trim();
  const map = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "video/mp4": ".mp4",
    "video/webm": ".webm",
    "application/json": ".json",
  };
  return map[type] || "";
}

function ossUrlForObjectKey(objectKey) {
  const bucket = required("ALIYUN_OSS_BUCKET");
  const endpoint = required("ALIYUN_OSS_ENDPOINT")
    .replace(/^https?:\/\//, "")
    .replace(/\/+$/, "");
  return `https://${bucket}.${endpoint}/${encodePath(objectKey)}`;
}

function publicUrlForObjectKey(objectKey) {
  const publicBase = (process.env.ALIYUN_OSS_PUBLIC_BASE_URL || "")
    .trim()
    .replace(/\/+$/, "");
  const url = ossUrlForObjectKey(objectKey);
  return publicBase ? `${publicBase}/${encodePath(objectKey)}` : url;
}

function ossRequestHeaders(method, contentType, objectKey) {
  const bucket = required("ALIYUN_OSS_BUCKET");
  const accessKeyId = required("ALIYUN_OSS_ACCESS_KEY_ID");
  const accessKeySecret = required("ALIYUN_OSS_ACCESS_KEY_SECRET");
  const date = new Date().toUTCString();
  const resource = `/${bucket}/${objectKey}`;
  const ossHeaders =
    method === "PUT"
      ? `x-oss-date:${date}\nx-oss-object-acl:public-read\n`
      : `x-oss-date:${date}\n`;
  const stringToSign = `${method}\n\n${contentType || ""}\n${date}\n${ossHeaders}${resource}`;
  const signature = crypto
    .createHmac("sha1", accessKeySecret)
    .update(stringToSign)
    .digest("base64");
  return {
    Authorization: `OSS ${accessKeyId}:${signature}`,
    ...(contentType ? { "Content-Type": contentType } : {}),
    ...(method === "PUT" ? { "x-oss-object-acl": "public-read" } : {}),
    "x-oss-date": date,
  };
}

function firstText(richText = []) {
  return richText.map((entry) => entry.plain_text || "").join("");
}

function captionText(value = {}) {
  return firstText(value.caption || []);
}

function propTitle(properties) {
  return firstText(properties.Title?.title || []);
}

function propSelect(properties, name) {
  return properties[name]?.select?.name || "";
}

function propMulti(properties, name) {
  return (properties[name]?.multi_select || []).map((item) => item.name);
}

function propUrl(properties, name) {
  return properties[name]?.url || "";
}

function propCheckbox(properties, name) {
  return Boolean(properties[name]?.checkbox);
}

function propNumber(properties, name) {
  return Number(properties[name]?.number || new Date().getFullYear());
}

function propFiles(properties, name) {
  return properties[name]?.files || [];
}

function normalizeWorkStatus(value) {
  if (value === "Pubulished" || value === "Published") return "Published";
  if (value === "Hidden") return "Hidden";
  return "Draft";
}

function normalizeCategory(value) {
  if (value === "APP / UI") return "App / UI";
  if (value === "Github") return "GitHub";
  return value || "Other";
}

async function notion(pathname, options = {}) {
  const response = await limitNotion(() =>
    fetchWithRetry(`https://api.notion.com/v1${pathname}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${required("NOTION_TOKEN")}`,
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    }),
  );
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Notion API failed ${response.status}: ${body}`);
  }
  return response.json();
}

async function querySyncPages(databaseId, options = {}) {
  const pages = [];
  let startCursor;
  do {
    const body = {
      page_size: 100,
      ...(options.all
        ? {}
        : {
            filter: {
              or: [
                { property: "同步状态", status: { equals: "待同步" } },
                { property: "同步状态", status: { equals: "待更新" } },
              ],
            },
          }),
    };
    if (startCursor) body.start_cursor = startCursor;
    const data = await notion(`/databases/${databaseId}/query`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    pages.push(...data.results);
    startCursor = data.has_more ? data.next_cursor : undefined;
  } while (startCursor);
  return pages;
}

async function getPagesByIds(pageIds) {
  return mapWithConcurrency(pageIds, NOTION_CONCURRENCY, (pageId) =>
    notion(`/pages/${pageId}`),
  );
}

async function listBlocks(blockId) {
  const blocks = [];
  let startCursor;
  do {
    const query = new URLSearchParams({ page_size: "100" });
    if (startCursor) query.set("start_cursor", startCursor);
    const data = await notion(`/blocks/${blockId}/children?${query}`);
    blocks.push(...data.results);
    startCursor = data.has_more ? data.next_cursor : undefined;
  } while (startCursor);
  return blocks;
}

function fileUrl(file) {
  if (!file) return "";
  if (file.type === "file") return file.file?.url || "";
  if (file.type === "external") return file.external?.url || "";
  return "";
}

function mediaUrl(block) {
  if (block.type === "image") return fileUrl(block.image);
  if (block.type === "video") return fileUrl(block.video);
  if (block.type === "file") return fileUrl(block.file);
  return "";
}

function textFromBlock(block) {
  const value = block[block.type];
  return firstText(value?.rich_text || []);
}

function textBlockType(type) {
  if (type === "heading_1" || type === "heading_2" || type === "heading_3") return "heading";
  if (type === "bulleted_list_item" || type === "numbered_list_item") return "list";
  if (type === "bookmark") return "embed";
  if (["paragraph", "quote", "callout", "code"].includes(type)) return type;
  return "paragraph";
}

function headingLevel(type) {
  if (type === "heading_1") return 1;
  if (type === "heading_2") return 2;
  if (type === "heading_3") return 3;
  return undefined;
}

function textBlockSize(type) {
  if (type === "heading_1") return "xl";
  if (type === "heading_2") return "lg";
  if (type === "heading_3") return "md";
  return "md";
}

function textBlockWeight(type) {
  return type.startsWith("heading") ? "bold" : "normal";
}

function calloutIcon(block) {
  const icon = block.callout?.icon;
  if (!icon) return "";
  if (icon.type === "emoji") return icon.emoji || "";
  return "";
}

async function download(url) {
  const response = await fetchWithRetry(url);
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Download failed ${response.status}: ${body}`);
  }
  const contentType =
    response.headers.get("content-type") || "application/octet-stream";
  const buffer = Buffer.from(await response.arrayBuffer());
  return { buffer, contentType };
}

function safeMediaSuffix(suffix) {
  return String(suffix || "media")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function mediaObjectKey(prefix, label, suffix, ext) {
  return [
    cleanPart(process.env.ALIYUN_OSS_DIR || "uploads"),
    cleanPart(prefix),
    `${label}-${safeMediaSuffix(suffix) || "media"}${ext || ""}`,
  ]
    .filter(Boolean)
    .join("/");
}

function mediaExtCandidates(url, fallbackExt = "") {
  const fromUrl = extensionFromUrl(url);
  const candidates = [
    fromUrl,
    fallbackExt,
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".gif",
    ".mp4",
    ".webm",
  ].filter(Boolean);
  return [...new Set(candidates)];
}

async function ossObjectExists(objectKey) {
  const response = await fetchWithRetry(ossUrlForObjectKey(objectKey), {
    method: "HEAD",
    headers: ossRequestHeaders("HEAD", "", objectKey),
    retries: 1,
  });
  if (response.ok) return true;
  if (response.status === 403 || response.status === 404) return false;
  const body = await response.text().catch(() => "");
  throw new Error(`OSS HEAD failed ${response.status}: ${body}`);
}

async function findExistingMediaObject(prefix, label, suffix, extCandidates) {
  for (const ext of extCandidates) {
    const objectKey = mediaObjectKey(prefix, label, suffix, ext);
    if (await ossObjectExists(objectKey)) return objectKey;
  }
  return "";
}

async function uploadBuffer(buffer, contentType, objectKey) {
  const url = ossUrlForObjectKey(objectKey);
  const response = await fetchWithRetry(url, {
    method: "PUT",
    headers: ossRequestHeaders("PUT", contentType, objectKey),
    body: buffer,
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`OSS upload failed ${response.status}: ${body}`);
  }
  return publicUrlForObjectKey(objectKey);
}

async function uploadRemoteMediaNow(url, prefix, label, suffix) {
  if (!url) {
    throw new Error(`Missing media URL for ${prefix}/${label}-${suffix}`);
  }
  const existingObjectKey = await findExistingMediaObject(
    prefix,
    label,
    suffix,
    mediaExtCandidates(url),
  );
  if (existingObjectKey) {
    console.log(`  Reusing ${label} ${suffix}: ${existingObjectKey}`);
    return publicUrlForObjectKey(existingObjectKey);
  }

  console.log(`  Downloading ${label} ${suffix}: ${url.slice(0, 96)}`);
  const { buffer, contentType } = await download(url);
  const fallbackExt = extFromContentType(contentType);
  const ext = extensionFromUrl(url, fallbackExt) || fallbackExt;
  const safeExt = ext && ext.length <= 12 ? ext : fallbackExt;
  const objectKey = mediaObjectKey(prefix, label, suffix, safeExt);

  if (await ossObjectExists(objectKey)) {
    console.log(`  Reusing ${label} ${suffix}: ${objectKey}`);
    return publicUrlForObjectKey(objectKey);
  }

  console.log(`  Uploading ${label} ${suffix}: ${objectKey}`);
  const uploaded = await uploadBuffer(buffer, contentType, objectKey);
  console.log(`  Uploaded ${label} ${suffix}`);
  return uploaded;
}

async function uploadRemoteMedia(url, prefix, label, suffix) {
  return limitMedia(() => uploadRemoteMediaNow(url, prefix, label, suffix));
}

async function uploadJson(content) {
  const buffer = Buffer.from(JSON.stringify(content, null, 2));
  const objectKey = [
    cleanPart(process.env.ALIYUN_OSS_DIR || "uploads"),
    "site-content.json",
  ]
    .filter(Boolean)
    .join("/");
  return uploadBuffer(buffer, "application/json", objectKey);
}

async function fetchPublishedContent() {
  const url = process.env.VITE_CONTENT_URL || DEFAULT_CONTENT_URL;
  const response = await fetchWithRetry(`${url}?t=${Date.now()}`);
  if (!response.ok) {
    throw new Error(`Could not fetch published content ${response.status}`);
  }
  return response.json();
}

function upsertById(items, next) {
  const index = items.findIndex((item) => item.id === next.id);
  if (index === -1) return [...items, next];
  return items.map((item, itemIndex) => (itemIndex === index ? next : item));
}

function removePlaceholderContent(content) {
  const projectCount = content.projects.length;
  const labCount = content.labItems.length;
  content.projects = content.projects.filter(
    (project) => !PLACEHOLDER_PROJECT_IDS.has(project.id),
  );
  content.labItems = content.labItems.filter(
    (item) => !PLACEHOLDER_LAB_IDS.has(item.id),
  );
  return projectCount !== content.projects.length || labCount !== content.labItems.length;
}

function slugLike(value, fallback) {
  return slugify(value, fallback);
}

function migratePublishedContent(content) {
  let changed = false;
  content.projects = content.projects.map((project) => {
    const { description: _description, role: _role, ...rest } = project;
    const next = { ...rest };
    if (project.description !== undefined || project.role !== undefined) changed = true;
    if (next.id === "notion-3736cfcdf85b") {
      next.id = `work-${slugLike(next.slug || next.title, "item")}`;
      changed = true;
    }
    if (!next.slug) {
      next.slug = slugLike(next.title, next.id);
      changed = true;
    }
    return next;
  });
  content.labItems = content.labItems.map((item) => {
    const { description: _description, techStack: _techStack, ...rest } = item;
    const next = { ...rest };
    if (item.description !== undefined || item.techStack !== undefined) changed = true;
    if (next.id === "notion-3736cfcdf85b") {
      next.id = `lab-${slugLike(next.slug || next.title, "item")}`;
      changed = true;
    }
    if (!next.slug) {
      next.slug = slugLike(next.title, next.id);
      changed = true;
    }
    return next;
  });
  return changed;
}

async function buildEntry(page) {
  const title = propTitle(page.properties);
  const type = propSelect(page.properties, "Type");
  const idBase = page.id.replace(/-/g, "").slice(0, 24);
  const slug = slugify(title, `notion-${idBase}`);
  const prefix = `${type.toLowerCase()}/${slug}`;
  const categories = propMulti(page.properties, "Category").map(normalizeCategory);
  const blocks = await listBlocks(page.id);

  const galleryImages = [];
  const videos = [];
  const richContent = await blocksToRichBlocks(blocks, prefix);
  galleryImages.splice(0, galleryImages.length, ...collectBlockValues(richContent, "image"));
  videos.splice(0, videos.length, ...collectBlockValues(richContent, "video"));
  const textParts = collectText(richContent);

  const coverFile = propFiles(page.properties, "Cover")[0];
  let coverImage = galleryImages[0] || "";
  const coverUrl = fileUrl(coverFile);
  if (coverUrl) {
    coverImage = await uploadRemoteMedia(coverUrl, prefix, "cover", "00");
  }

  if (type === "Lab") {
    return {
      kind: "lab",
      item: {
        id: `notion-${idBase}`,
        slug,
        title,
        type: categories[0] || "Notes",
        status: propSelect(page.properties, "Status") || "Idea",
        coverImage,
        github: propUrl(page.properties, "GitHub URL") || undefined,
        demo: propUrl(page.properties, "Demo URL") || undefined,
        content: textParts.join("\n\n"),
        richContent,
        galleryImages,
        videoUrl: videos[0],
        externalUrl:
          propUrl(page.properties, "Demo URL") ||
          propUrl(page.properties, "GitHub URL") ||
          undefined,
        featured: propCheckbox(page.properties, "Featured"),
        hidden: false,
      },
    };
  }

  return {
    kind: "work",
    item: {
      id: `notion-${idBase}`,
      slug,
      title,
      category: categories[0] || "Other",
      year: propNumber(page.properties, "Year"),
      content: textParts.join("\n\n"),
      richContent,
      coverImage,
      galleryImages,
      videoUrl: videos[0],
      externalUrl: propUrl(page.properties, "Demo URL") || undefined,
      status: normalizeWorkStatus(propSelect(page.properties, "Status")),
      featured: propCheckbox(page.properties, "Featured"),
      sortOrder: 1,
    },
  };
}

async function blocksToRichBlocks(blocks, prefix) {
  return (
    await mapWithConcurrency(blocks, BLOCK_CONCURRENCY, (block) =>
      notionBlockToRichBlock(block, prefix),
    )
  ).filter(Boolean);
}

async function notionBlockToRichBlock(block, prefix) {
  const id = block.id.replace(/-/g, "").slice(0, 24);

  if (block.type === "unsupported" || block.archived || block.in_trash) {
    return null;
  }

  if (block.type === "divider") {
    return { id, type: "divider", value: "" };
  }

  if (block.type === "column_list") {
    const columns = block.has_children
      ? await blocksToRichBlocks(await listBlocks(block.id), prefix)
      : [];
    return {
      id,
      type: "columns",
      value: "",
      width: "wide",
      columns: columns.map((column) => column.children || []),
    };
  }

  if (block.type === "column") {
    const children = block.has_children
      ? await blocksToRichBlocks(await listBlocks(block.id), prefix)
      : [];
    return {
      id,
      type: "fallback",
      value: "column",
      children,
    };
  }

  if (block.type === "image" || block.type === "video") {
    const uploaded = await uploadRemoteMedia(
      mediaUrl(block),
      prefix,
      block.type,
      id,
    );
    return {
      id,
      type: block.type,
      value: uploaded,
      caption: captionText(block[block.type]),
      width: "wide",
      align: "center",
    };
  }

  if (block.type === "bookmark" || block.type === "embed") {
    const value = block[block.type]?.url || "";
    return {
      id,
      type: "embed",
      value,
      text: value,
      url: value,
      width: "wide",
    };
  }

  if (block.type === "table") {
    const rows = block.has_children
      ? (await listBlocks(block.id))
          .filter((row) => row.type === "table_row")
          .map((row) =>
            (row.table_row?.cells || []).map((cell) => firstText(cell)),
          )
      : [];
    return {
      id,
      type: "table",
      value: "",
      rows,
      width: "wide",
    };
  }

  const isTextLike = [
    "paragraph",
    "heading_1",
    "heading_2",
    "heading_3",
    "bulleted_list_item",
    "numbered_list_item",
    "quote",
    "callout",
    "code",
  ].includes(block.type);

  if (!isTextLike) {
    return {
      id,
      type: "fallback",
      value: block.type,
      width: "wide",
    };
  }

  const children = block.has_children
    ? await blocksToRichBlocks(await listBlocks(block.id), prefix)
    : undefined;

  return {
    id,
    type: textBlockType(block.type),
    value: textFromBlock(block).trim(),
    text: textFromBlock(block).trim(),
    level: headingLevel(block.type),
    ordered: block.type === "numbered_list_item",
    items:
      block.type === "bulleted_list_item" || block.type === "numbered_list_item"
        ? [textFromBlock(block).trim()]
        : undefined,
    language: block.type === "code" ? block.code?.language : undefined,
    icon: block.type === "callout" ? calloutIcon(block) : undefined,
    children,
    size: textBlockSize(block.type),
    weight: textBlockWeight(block.type),
    width: "wide",
  };
}

function collectText(blocks) {
  const output = [];
  const walk = (items) => {
    for (const item of items || []) {
      if (item.value && !["image", "video", "bookmark", "embed"].includes(item.type)) {
        output.push(item.value);
      }
      if (item.children?.length) walk(item.children);
      if (item.columns?.length) {
        for (const column of item.columns) walk(column);
      }
    }
  };
  walk(blocks);
  return output;
}

function collectBlockValues(blocks, type) {
  const output = [];
  const walk = (items) => {
    for (const item of items || []) {
      if (item.type === type && item.value) output.push(item.value);
      if (item.children?.length) walk(item.children);
      if (item.columns?.length) {
        for (const column of item.columns) walk(column);
      }
    }
  };
  walk(blocks);
  return output;
}

async function markSynced(pageId) {
  await notion(`/pages/${pageId}`, {
    method: "PATCH",
    body: JSON.stringify({
      properties: {
        同步状态: {
          status: {
            name: "已同步",
          },
        },
      },
    }),
  });
}

async function main() {
  loadEnv(ENV_PATH);
  const startedAt = Date.now();
  const pageIds = envList("SYNC_PAGE_IDS");
  const pageLimit = Number(process.env.SYNC_PAGE_LIMIT || 0);
  const dryRun = envFlag("SYNC_DRY_RUN");
  const skipMark = envFlag("SYNC_SKIP_MARK");
  const syncAll = envFlag("SYNC_ALL");
  const queriedPages = pageIds.length
    ? await getPagesByIds(pageIds)
    : await querySyncPages(required("NOTION_DATABASE_ID"), { all: syncAll });
  const pages = pageLimit > 0 ? queriedPages.slice(0, pageLimit) : queriedPages;

  console.log(
    `Found ${queriedPages.length} page(s); syncing ${pages.length}${
      dryRun ? " in dry-run mode" : ""
    }.`,
  );
  if (syncAll) console.log("SYNC_ALL is enabled; status filter is disabled.");

  const content = await fetchPublishedContent();
  content.projects = Array.isArray(content.projects) ? content.projects : [];
  content.labItems = Array.isArray(content.labItems) ? content.labItems : [];
  const removedPlaceholders = removePlaceholderContent(content);
  const migratedContent = migratePublishedContent(content);
  const processedPages = [];

  for (const page of pages) {
    const pageStartedAt = Date.now();
    const title = propTitle(page.properties);
    console.log(`Syncing: ${title}`);
    const entry = await buildEntry(page);
    if (entry.kind === "work") {
      content.projects = upsertById(content.projects, entry.item);
    } else {
      content.labItems = upsertById(content.labItems, entry.item);
    }
    processedPages.push({ id: page.id, title });
    console.log(`Built: ${title} (${Math.round((Date.now() - pageStartedAt) / 1000)}s)`);

    if (!dryRun) {
      const uploadedUrl = await uploadJson(content);
      console.log(`Uploaded site content after ${title}: ${uploadedUrl}`);

      if (!skipMark) {
        await markSynced(page.id);
        console.log(`Marked synced: ${title}`);
      }
    }
  }

  if (!pages.length && !removedPlaceholders && !migratedContent) {
    console.log("Nothing to upload.");
    return;
  }

  if (dryRun) {
    console.log("Dry run complete; skipped site content upload and Notion status updates.");
    return;
  }

  if (!processedPages.length) {
    const uploadedUrl = await uploadJson(content);
    console.log(`Uploaded site content: ${uploadedUrl}`);
  }

  if (skipMark && processedPages.length) {
    console.log("SYNC_SKIP_MARK is enabled; skipped Notion status updates.");
  }

  console.log(`Done in ${Math.round((Date.now() - startedAt) / 1000)}s.`);
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});

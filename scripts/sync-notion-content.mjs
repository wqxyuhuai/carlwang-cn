import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const ENV_PATH = path.join(ROOT, ".env.local");
const NOTION_VERSION = "2022-06-28";
const DEFAULT_CONTENT_URL =
  "https://carlwang-cn.oss-cn-shanghai.aliyuncs.com/uploads/site-content.json";
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

function firstText(richText = []) {
  return richText.map((entry) => entry.plain_text || "").join("");
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
  const response = await fetch(`https://api.notion.com/v1${pathname}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${required("NOTION_TOKEN")}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Notion API failed ${response.status}: ${body}`);
  }
  return response.json();
}

async function querySyncPages(databaseId) {
  const pages = [];
  let startCursor;
  do {
    const body = {
      page_size: 100,
      filter: {
        or: [
          { property: "同步状态", status: { equals: "待同步" } },
          { property: "同步状态", status: { equals: "待更新" } },
        ],
      },
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

async function download(url) {
  const response = await fetch(url);
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Download failed ${response.status}: ${body}`);
  }
  const contentType =
    response.headers.get("content-type") || "application/octet-stream";
  const buffer = Buffer.from(await response.arrayBuffer());
  return { buffer, contentType };
}

async function uploadBuffer(buffer, contentType, objectKey) {
  const bucket = required("ALIYUN_OSS_BUCKET");
  const endpoint = required("ALIYUN_OSS_ENDPOINT")
    .replace(/^https?:\/\//, "")
    .replace(/\/+$/, "");
  const accessKeyId = required("ALIYUN_OSS_ACCESS_KEY_ID");
  const accessKeySecret = required("ALIYUN_OSS_ACCESS_KEY_SECRET");
  const date = new Date().toUTCString();
  const resource = `/${bucket}/${objectKey}`;
  const ossHeaders = `x-oss-date:${date}\nx-oss-object-acl:public-read\n`;
  const stringToSign = `PUT\n\n${contentType}\n${date}\n${ossHeaders}${resource}`;
  const signature = crypto
    .createHmac("sha1", accessKeySecret)
    .update(stringToSign)
    .digest("base64");
  const url = `https://${bucket}.${endpoint}/${encodePath(objectKey)}`;
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `OSS ${accessKeyId}:${signature}`,
      "Content-Type": contentType,
      "x-oss-date": date,
      "x-oss-object-acl": "public-read",
    },
    body: buffer,
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`OSS upload failed ${response.status}: ${body}`);
  }
  const publicBase = (process.env.ALIYUN_OSS_PUBLIC_BASE_URL || "")
    .trim()
    .replace(/\/+$/, "");
  return publicBase ? `${publicBase}/${encodePath(objectKey)}` : url;
}

async function uploadRemoteMedia(url, prefix, label, index) {
  const { buffer, contentType } = await download(url);
  const fallbackExt = extFromContentType(contentType);
  const ext = extensionFromUrl(url, fallbackExt) || fallbackExt;
  const safeExt = ext && ext.length <= 12 ? ext : fallbackExt;
  const objectKey = [
    cleanPart(process.env.ALIYUN_OSS_DIR || "uploads"),
    cleanPart(prefix),
    `${label}-${String(index).padStart(2, "0")}${safeExt}`,
  ]
    .filter(Boolean)
    .join("/");
  return uploadBuffer(buffer, contentType, objectKey);
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
  const response = await fetch(`${url}?t=${Date.now()}`);
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

  let mediaIndex = 1;
  const richContent = [];
  const galleryImages = [];
  const videos = [];
  const textParts = [];

  for (const block of blocks) {
    if (["paragraph", "heading_1", "heading_2", "heading_3", "quote"].includes(block.type)) {
      const value = textFromBlock(block).trim();
      if (!value) continue;
      textParts.push(value);
      richContent.push({
        id: `${block.id.replace(/-/g, "").slice(0, 12)}`,
        type: "text",
        value,
        size: block.type.startsWith("heading") ? "lg" : "md",
        weight: block.type.startsWith("heading") ? "bold" : "normal",
      });
    }

    if (block.type === "image") {
      const uploaded = await uploadRemoteMedia(
        mediaUrl(block),
        prefix,
        "image",
        mediaIndex++,
      );
      galleryImages.push(uploaded);
      richContent.push({
        id: `${block.id.replace(/-/g, "").slice(0, 12)}`,
        type: "image",
        value: uploaded,
        width: "wide",
        align: "center",
      });
    }

    if (block.type === "video") {
      const uploaded = await uploadRemoteMedia(
        mediaUrl(block),
        prefix,
        "video",
        mediaIndex++,
      );
      videos.push(uploaded);
      richContent.push({
        id: `${block.id.replace(/-/g, "").slice(0, 12)}`,
        type: "video",
        value: uploaded,
        width: "wide",
        align: "center",
      });
    }
  }

  const coverFile = propFiles(page.properties, "Cover")[0];
  let coverImage = galleryImages[0] || "";
  const coverUrl = fileUrl(coverFile);
  if (coverUrl) {
    coverImage = await uploadRemoteMedia(coverUrl, prefix, "cover", 0);
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
  const pages = await querySyncPages(required("NOTION_DATABASE_ID"));
  console.log(`Found ${pages.length} page(s) to sync.`);

  const content = await fetchPublishedContent();
  content.projects = Array.isArray(content.projects) ? content.projects : [];
  content.labItems = Array.isArray(content.labItems) ? content.labItems : [];
  const removedPlaceholders = removePlaceholderContent(content);
  const migratedContent = migratePublishedContent(content);

  for (const page of pages) {
    const title = propTitle(page.properties);
    console.log(`Syncing: ${title}`);
    const entry = await buildEntry(page);
    if (entry.kind === "work") {
      content.projects = upsertById(content.projects, entry.item);
    } else {
      content.labItems = upsertById(content.labItems, entry.item);
    }
    await markSynced(page.id);
    console.log(`Marked synced: ${title}`);
  }

  if (!pages.length && !removedPlaceholders && !migratedContent) {
    console.log("Nothing to upload.");
    return;
  }

  const uploadedUrl = await uploadJson(content);
  console.log(`Uploaded site content: ${uploadedUrl}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});

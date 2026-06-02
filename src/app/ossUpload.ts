import type { OssSettings } from "./contentStore";

function cleanPart(value: string) {
  return value.trim().replace(/^\/+|\/+$/g, "");
}

function encodePath(path: string) {
  return path
    .split("/")
    .filter(Boolean)
    .map((part) => encodeURIComponent(part))
    .join("/");
}

function normalizeEndpoint(endpoint: string) {
  return endpoint.trim().replace(/^https?:\/\//, "").replace(/\/+$/, "");
}

function randomName(file: File) {
  const extension = file.name.includes(".") ? file.name.split(".").pop() : "";
  const suffix = extension ? `.${extension}` : "";
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}${suffix}`;
}

async function hmacSha1(message: string, secret: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  const bytes = new Uint8Array(signature);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

export function canUploadToOss(settings?: OssSettings) {
  return Boolean(
    settings?.enabled &&
      settings.bucket.trim() &&
      settings.endpoint.trim() &&
      settings.accessKeyId.trim() &&
      settings.accessKeySecret.trim(),
  );
}

export async function uploadToOss(
  file: File,
  settings?: OssSettings,
  pathPrefix = "",
  objectName?: string,
) {
  if (!canUploadToOss(settings) || !settings) {
    throw new Error("Aliyun OSS is not configured.");
  }

  const bucket = settings.bucket.trim();
  const endpoint = normalizeEndpoint(settings.endpoint);
  const directory = cleanPart(settings.directory || "uploads");
  const prefix = cleanPart(pathPrefix);
  const objectKey = [directory, prefix, objectName || randomName(file)].filter(Boolean).join("/");
  const contentType = file.type || "application/octet-stream";
  const date = new Date().toUTCString();
  const ossHeaders = `x-oss-date:${date}\nx-oss-object-acl:public-read\n`;
  const resource = `/${bucket}/${objectKey}`;
  const stringToSign = `PUT\n\n${contentType}\n\n${ossHeaders}${resource}`;
  const signature = await hmacSha1(stringToSign, settings.accessKeySecret);
  const url = `https://${bucket}.${endpoint}/${encodePath(objectKey)}`;

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `OSS ${settings.accessKeyId}:${signature}`,
      "Content-Type": contentType,
      "x-oss-date": date,
      "x-oss-object-acl": "public-read",
    },
    body: file,
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`OSS upload failed (${response.status}). ${body}`);
  }

  const publicBaseUrl = settings.publicBaseUrl.trim().replace(/\/+$/, "");
  return publicBaseUrl
    ? `${publicBaseUrl}/${encodePath(objectKey)}`
    : url;
}

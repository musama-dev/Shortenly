import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { seedLinks } from "../api/links-seed.mjs";

/**
 * Shared data access used by the Node server (server/index.mjs), the Vite
 * dev middleware (frontend/vite.config.ts), and the Vercel functions.
 *
 * Persistence strategy (first available wins):
 *  1. Vercel Blob  — BLOB_READ_WRITE_TOKEN set (recommended on Vercel).
 *  2. Vercel KV / Upstash (REST) — KV_REST_API_URL/…TOKEN or UPSTASH_*.
 *  3. JSON file — local dev / Node server (falls back to bundled seed).
 */
export const DATA_URL = new URL("../data/links.json", import.meta.url);
export const DATA_PATH = fileURLToPath(DATA_URL);

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const BLOB_KEY = "links.json";
const BLOB_URL =
  process.env.SHORTENLY_BLOB_URL ||
  "https://u6dnjyxg4mk7qnn1.private.blob.vercel-storage.com";

const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const KV_KEY = "shortenly:links";

async function tryRead(path) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch {
    return null;
  }
}

/* --- Vercel Blob helpers -------------------------------------------------- */

async function blobGet() {
  try {
    const res = await fetch(`${BLOB_URL}/${BLOB_KEY}`, {
      headers: { Authorization: `Bearer ${BLOB_TOKEN}` },
    });
    if (!res.ok) return null;
    const text = await res.text();
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

async function blobSet(links) {
  const body = new FormData();
  body.append(
    "file",
    new Blob([JSON.stringify(links)], { type: "application/json" }),
    BLOB_KEY,
  );
  const res = await fetch(`${BLOB_URL}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${BLOB_TOKEN}` },
    body,
  });
  if (!res.ok) throw new Error(`blob put failed: ${res.status}`);
}

/* --- KV (Vercel / Upstash) REST helpers ----------------------------------- */

async function kvGet() {
  try {
    const res = await fetch(`${KV_URL}/get/${KV_KEY}`, {
      headers: { Authorization: `Bearer ${KV_TOKEN}` },
    });
    if (!res.ok) return null;
    const body = await res.json();
    return body.result ? JSON.parse(body.result) : null;
  } catch {
    return null;
  }
}

async function kvSet(links) {
  try {
    await fetch(`${KV_URL}/set/${KV_KEY}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${KV_TOKEN}` },
      body: JSON.stringify(links),
    });
  } catch {
    /* ignore — file / seed fallback covers it */
  }
}

const hasBlob = Boolean(BLOB_TOKEN);
const hasKV = Boolean(KV_URL && KV_TOKEN);

export async function readLinks() {
  if (hasBlob) return (await blobGet()) ?? seedLinks;
  if (hasKV) return (await kvGet()) ?? seedLinks;
  return (await tryRead(DATA_PATH)) ?? seedLinks;
}

export async function writeLinks(links) {
  if (hasBlob) {
    await blobSet(links);
    return;
  }
  if (hasKV) {
    await kvSet(links);
    return;
  }
  try {
    await writeFile(DATA_PATH, JSON.stringify(links, null, 2), "utf8");
  } catch {
    /* Ephemeral filesystem (Vercel, no storage): runtime links last the invocation. */
  }
}

export function makeAlias(len = 6) {
  const chars = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

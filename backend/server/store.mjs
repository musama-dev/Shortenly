import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { seedLinks } from "../api/links-seed.mjs";

/**
 * Shared data access used by the Node server (server/index.mjs), the Vite
 * dev middleware (frontend/vite.config.ts), and the Vercel functions.
 *
 * Persistence strategy:
 *  - Vercel KV / Upstash (REST) when KV_REST_API_URL + KV_REST_API_TOKEN
 *    (or UPSTASH_REDIS_REST_*) are set. This survives serverless cold starts,
 *    so links created at runtime resolve on the live site.
 *  - Otherwise the JSON file. Reads fall back to the bundled seed copy so the
 *    seed links always work.
 */
export const DATA_URL = new URL("../data/links.json", import.meta.url);
export const DATA_PATH = fileURLToPath(DATA_URL);

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

/* --- KV (Vercel / Upstash) REST helpers ---------------------------------- */

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

const hasKV = Boolean(KV_URL && KV_TOKEN);

export async function readLinks() {
  if (hasKV) return (await kvGet()) ?? seedLinks;
  return (await tryRead(DATA_PATH)) ?? seedLinks;
}

export async function writeLinks(links) {
  if (hasKV) {
    await kvSet(links);
    return;
  }
  try {
    await writeFile(DATA_PATH, JSON.stringify(links, null, 2), "utf8");
  } catch {
    /* Ephemeral filesystem (Vercel, no KV): runtime links last the invocation. */
  }
}

export function makeAlias(len = 6) {
  const chars = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

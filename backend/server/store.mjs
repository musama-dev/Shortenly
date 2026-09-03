import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { seedLinks } from "../api/links-seed.mjs";

/**
 * Shared data access used by both the Node server (server/index.mjs),
 * the Vite dev middleware (frontend/vite.config.ts), and the Vercel
 * serverless functions (api/*.js).
 *
 * On Vercel the filesystem is ephemeral and `data/links.json` lives outside
 * the function bundle, so reads fall back to the bundled seed copy
 * (api/links-seed.json) and writes are best-effort.
 */
export const DATA_URL = new URL("../data/links.json", import.meta.url);
export const DATA_PATH = fileURLToPath(DATA_URL);

async function tryRead(path) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch {
    return null;
  }
}

export async function readLinks() {
  return (await tryRead(DATA_PATH)) ?? seedLinks;
}

export async function writeLinks(links) {
  try {
    await writeFile(DATA_PATH, JSON.stringify(links, null, 2), "utf8");
  } catch {
    /* Ephemeral filesystem (Vercel): runtime links live for the invocation only. */
  }
}

export function makeAlias(len = 6) {
  const chars = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

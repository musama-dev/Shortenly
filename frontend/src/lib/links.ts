/* Demo data layer. In production this calls the server API; the seed below is
 * shared with the redirect server via data/links.json so both stay in sync. */

import seed from "../../../backend/data/links.json";

export interface Link {
  id: string;
  alias: string;
  title: string;
  destination: string;
  createdAt: number;
  clicks: number;
  status: "active" | "expired" | "disabled";
  expiresAt?: number;
  clicksByDay: number[];
  topReferrers: { name: string; clicks: number }[];
  topCountries: { name: string; clicks: number }[];
  devices: { name: string; share: number }[];
}

type SeedLink = { id: string; alias: string; title: string; destination: string; clicks: number; status?: string };
const ALIASES: SeedLink[] = seed;

function series(seed: number): number[] {
  let s = seed;
  return Array.from({ length: 30 }, (_, i) => {
    s = (s * 9301 + 49297) % 233280;
    const wave = Math.sin(i / 4 + seed) * 0.3 + 0.7;
    return Math.max(2, Math.round((s / 233280) * 40 * wave + 4));
  });
}

const REFERRERS = [
  { name: "twitter.com", clicks: 4218 },
  { name: "news.ycombinator.com", clicks: 2931 },
  { name: "linkedin.com", clicks: 1874 },
  { name: "Direct", clicks: 1653 },
  { name: "newsletter", clicks: 904 },
];
const COUNTRIES = [
  { name: "United States", clicks: 5412 },
  { name: "Germany", clicks: 2138 },
  { name: "United Kingdom", clicks: 1742 },
  { name: "Japan", clicks: 1194 },
  { name: "Brazil", clicks: 908 },
];
const DEVICES = [
  { name: "Mobile", share: 58 },
  { name: "Desktop", share: 34 },
  { name: "Tablet", share: 8 },
];

export const demoLinks: Link[] = ALIASES.map((a, i) => ({
  id: a.id || `link-${i}`,
  alias: a.alias,
  title: a.title,
  destination: a.destination,
  createdAt: Date.now() - (i + 2) * 86400000 * 3,
  clicks: a.clicks,
  status: (a.status === "disabled" || a.status === "expired" ? a.status : "active") as Link["status"],
  clicksByDay: series(i * 7 + 13),
  topReferrers: REFERRERS,
  topCountries: COUNTRIES,
  devices: DEVICES,
}));

export function makeAlias(len = 6): string {
  const chars = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export function normalizeUrl(raw: string): string | null {
  const v = raw.trim();
  if (!v) return null;
  const withProto = /^https?:\/\//i.test(v) ? v : `https://${v}`;
  try {
    const u = new URL(withProto);
    if (!u.hostname.includes(".") || u.hostname.endsWith(".")) return null;
    return u.toString();
  } catch {
    return null;
  }
}

export function createLink(destination: string, opts?: { alias?: string; title?: string }): Link {
  return {
    id: `link-${Date.now()}`,
    alias: opts?.alias || makeAlias(),
    title: opts?.title || destination.replace(/^https?:\/\//, "").split("/")[0],
    destination,
    createdAt: Date.now(),
    clicks: 0,
    status: "active",
    clicksByDay: Array(30).fill(0),
    topReferrers: [],
    topCountries: [],
    devices: [],
  };
}

export const SHORT_DOMAIN = "sho.rt";

/**
 * The shareable short URL — always a clean `{origin}/alias` that the backend
 * redirects to the original URL, exactly like a QR code / bit.ly.
 *
 * Works everywhere because every server has the redirect backend wired up:
 * - `npm run dev` (Vite dev middleware, see vite.config.ts)
 * - `npm run serve` (node server, see server/index.mjs)
 * - Vercel (serverless functions, see api/redirect.js)
 *
 * Set VITE_BASE_URL (e.g. https://sho.university.edu) to use a custom domain.
 */
export const shortUrl = (alias: string) => {
  const base = (import.meta.env.VITE_BASE_URL as string | undefined)?.replace(/\/$/, "") || window.location.origin;
  return `${base}/${alias}`;
};

/* Registry so created links are resolvable even after a page reload. */
const STORAGE_KEY = "shortenly:created-links";

function loadCreated(): Link[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as Link[];
  } catch {
    return [];
  }
}
function saveCreated() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(created));
  } catch {
    /* storage unavailable — links still work for this session */
  }
}
const created: Link[] = loadCreated();

export function registerLink(link: Link) {
  created.unshift(link);
  saveCreated();
  // Persist to the backend (dev middleware / node server / Vercel function).
  fetch("/api/links", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ alias: link.alias, title: link.title, destination: link.destination }),
  }).catch(() => {});
}

export function allLinks(): Link[] {
  return [...created, ...demoLinks];
}

export function findLinkByAlias(alias: string): Link | undefined {
  return allLinks().find((l) => l.alias === alias);
}

export function findLinkById(id: string): Link | undefined {
  return allLinks().find((l) => l.id === id);
}

/** Resolve an alias from the backend; used when the in-memory registry misses. */
export async function fetchLinkByAlias(alias: string): Promise<Link | undefined> {
  try {
    const res = await fetch(`/api/links`);
    if (!res.ok) return undefined;
    const links = (await res.json()) as { alias: string; destination: string; status?: string }[];
    const hit = links.find((l) => l.alias === alias && l.status !== "disabled");
    return hit ? { ...createLink(hit.destination, { alias }), status: "active" } : undefined;
  } catch {
    return undefined;
  }
}

import http from "node:http";
import { stat } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { readLinks, writeLinks, makeAlias } from "./store.mjs";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT = resolve(__dirname, "..");
// Frontend build output (from repo root: frontend/dist).
const DIST = process.env.DIST_DIR || resolve(ROOT, "..", "frontend", "dist");
const PORT = 3030; // local dev server port
const HOST = process.env.HOST || "0.0.0.0";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".json": "application/json",
  ".woff2": "font/woff2",
};

function send(res, status, body, type = "text/plain") {
  res.writeHead(status, { "Content-Type": type, "Cache-Control": "no-store" });
  res.end(body);
}

function json(res, status, data) {
  send(res, status, JSON.stringify(data), "application/json");
}

/* Serve a static asset from dist/, returning its content-type. Returns the path or null. */
async function serveStatic(pathname, res) {
  let filePath = join(DIST, decodeURIComponent(pathname));
  try {
    const info = await stat(filePath);
    if (info.isDirectory()) filePath = join(filePath, "index.html");
  } catch {
    return false;
  }
  try {
    const info = await stat(filePath);
    if (!info.isFile()) return false;
    const ext = extname(filePath);
    res.writeHead(200, {
      "Content-Type": MIME[ext] || "application/octet-stream",
      "Cache-Control": ext === ".html" ? "no-store" : "public, max-age=31536000, immutable",
    });
    createReadStream(filePath).pipe(res);
    return true;
  } catch {
    return false;
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = url.pathname;

  // SPA fallback: unknown non-API, non-asset paths serve the app shell.
  const isAsset = /\.\w+$/.test(pathname);
  const isApi = pathname.startsWith("/api/");

  try {
    // --- Render a short link (clean /alias) ---
    if (!isAsset && !isApi && pathname !== "/" && !pathname.startsWith("/assets/")) {
      const alias = decodeURIComponent(pathname.slice(1));
      const links = await readLinks();
      const link = links.find((l) => l.alias === alias);
      if (link && link.status !== "disabled") {
        // Redirect exactly like a QR code / bit.ly.
        res.writeHead(302, { Location: link.destination, "Cache-Control": "no-store" });
        res.end();
        return;
      }
      // Not a short link OR disabled: fall through to SPA (which shows 404 page).
    }

    // --- API ---
    if (isApi) {
      if (pathname === "/api/links" && req.method === "GET") {
        return json(res, 200, await readLinks());
      }
      if (pathname === "/api/links" && req.method === "POST") {
        let body = "";
        for await (const chunk of req) body += chunk;
        let parsed;
        try { parsed = JSON.parse(body); } catch { return json(res, 400, { error: "Invalid JSON" }); }
        const link = {
          id: parsed.id || `link-${Date.now()}`,
          alias: parsed.alias || makeAlias(),
          title: parsed.title || parsed.destination.replace(/^https?:\/\//, "").split("/")[0],
          destination: parsed.destination,
          clicks: 0,
          status: "active",
        };
        const links = await readLinks();
        if (links.some((l) => l.alias === link.alias)) return json(res, 409, { error: "Alias already in use" });
        links.unshift(link);
        await writeLinks(links);
        return json(res, 201, link);
      }
      return json(res, 404, { error: "Not found" });
    }

    // --- Static + SPA ---
    if (await serveStatic(pathname, res)) return;
    // SPA shell for client-side routes (/app, /r/:alias inside the app).
    res.writeHead(200, { "Content-Type": MIME[".html"], "Cache-Control": "no-store" });
    createReadStream(join(DIST, "index.html")).pipe(res);
  } catch (err) {
    send(res, 500, "Internal server error");
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Shortenly server → http://localhost:${PORT}`);
  console.log(`Short links resolve like http://localhost:${PORT}/summer`);
});

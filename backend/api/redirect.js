import { readLinks } from "../server/store.mjs";

/**
 * Vercel serverless entry for clean short links on a .vercel.app (or custom)
 * domain. A request to /<alias> redirects (302) to the original destination,
 * exactly like a QR code. Unknown paths fall through to the SPA shell so the
 * app's client-side routes keep working.
 */
export default async function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = url.pathname;

  // Serve the app shell directly (identical behaviour to a static host).
  const isAsset = /\.\w+$/.test(pathname);

  try {
    // Clean short link: /summer → redirect
    if (!isAsset && pathname !== "/" && !pathname.startsWith("/api/")) {
      const alias = decodeURIComponent(pathname.slice(1));
      const links = await readLinks();
      const link = links.find((l) => l.alias === alias);
      if (link && link.status !== "disabled") {
        res.statusCode = 302;
        res.setHeader("Location", link.destination);
        res.setHeader("Cache-Control", "no-store");
        res.end();
        return;
      }
    }

    // App shell for client-side routes.
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    res.end(shellHtml());
  } catch (err) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.end("<h1>Shortenly — something went wrong</h1>");
  }
}

/* Minimal inline SPA shell so the function is self-contained (no fs dependency). */
function shellHtml() {
  return `<!doctype html>
<html lang="en"><head><meta charset="UTF-8" /><title>Shortenly</title></head>
<body><p>Redirecting…</p>
<p>Visit the app at the site root. If you meant a short link, it may have been removed.</p>
</body></html>`;
}

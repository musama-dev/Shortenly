import { readLinks } from "../server/store.mjs";

/**
 * Vercel serverless entry for clean short links on a .vercel.app (or custom)
 * domain. A request to /<alias> redirects (302) to the original destination,
 * exactly like a QR code — with no intermediate page. Unknown paths bounce to
 * the app root so the visitor never sees a dead "Redirecting…" screen.
 */
export default async function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = url.pathname;

  const isAsset = /\.\w+$/.test(pathname);
  const isApi = pathname.startsWith("/api/");

  try {
    // Clean short link: /summer → 302 to the original URL.
    if (!isAsset && pathname !== "/" && !isApi) {
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
      // Not a short link: send the visitor to the app root instead of a dead page.
      res.statusCode = 302;
      res.setHeader("Location", "/");
      res.setHeader("Cache-Control", "no-store");
      res.end();
      return;
    }

    // Root / API / assets are handled by the static host — nothing to do here.
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.end("<!doctype html><html><body></body></html>");
  } catch {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.end("<!doctype html><html><body></body></html>");
  }
}

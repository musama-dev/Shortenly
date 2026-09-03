import { readLinks, writeLinks, makeAlias } from "../server/store.mjs";

/**
 * Vercel serverless entry for /api/links.
 *   GET  → list all links
 *   POST → create a link and persist it to data/links.json
 */
export default async function handler(req, res) {
  if (req.method === "GET") {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(await readLinks()));
    return;
  }

  if (req.method === "POST") {
    let body = "";
    for await (const chunk of req) body += chunk;
    let parsed;
    try {
      parsed = JSON.parse(body);
    } catch {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Invalid JSON" }));
      return;
    }

    const link = {
      id: parsed.id || `link-${Date.now()}`,
      alias: parsed.alias || makeAlias(),
      title: parsed.title || parsed.destination.replace(/^https?:\/\//, "").split("/")[0],
      destination: parsed.destination,
      clicks: 0,
      status: "active",
    };

    const links = await readLinks();
    if (links.some((l) => l.alias === link.alias)) {
      res.statusCode = 409;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Alias already in use" }));
      return;
    }
    links.unshift(link);
    await writeLinks(links);
    res.statusCode = 201;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(link));
    return;
  }

  res.statusCode = 405;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ error: "Method not allowed" }));
}

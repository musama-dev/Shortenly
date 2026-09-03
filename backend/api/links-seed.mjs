/**
 * Bundled seed so serverless functions (Vercel) always have data available —
 * the filesystem there is ephemeral and data/links.json is not deployed.
 */
export const seedLinks = [
  { "id": "link-0", "alias": "summer", "title": "Summer Sale", "destination": "https://example.com/campaigns/summer-sale-2026", "clicks": 12482, "status": "active" },
  { "id": "link-1", "alias": "launch", "title": "Product Launch", "destination": "https://example.com/blog/introducing-shortenly", "clicks": 8341, "status": "active" },
  { "id": "link-2", "alias": "docs", "title": "Documentation", "destination": "https://docs.example.com/getting-started/install", "clicks": 4192, "status": "active" },
  { "id": "link-3", "alias": "gh", "title": "GitHub Repo", "destination": "https://github.com/example/shortenly", "clicks": 2907, "status": "active" },
  { "id": "link-4", "alias": "webinar", "title": "August Webinar", "destination": "https://example.com/events/webinar-august-registration", "clicks": 1834, "status": "active" },
  { "id": "link-5", "alias": "careers", "title": "We're Hiring", "destination": "https://example.com/company/careers", "clicks": 962, "status": "disabled" },
];

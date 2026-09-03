/**
 * Vercel serverless entrypoint. Implementation lives in backend/; Vercel
 * requires functions inside the root `api/` directory, so we re-export.
 */
export { default } from "../backend/api/links.js";

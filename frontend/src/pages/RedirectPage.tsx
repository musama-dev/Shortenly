import { useEffect, useRef, useState } from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import { findLinkByAlias, fetchLinkByAlias, shortUrl, type Link } from "../lib/links";
import { Button } from "../components/ui/Button";
import "./redirect.css";

/** Client-side redirect: resolves an alias and forwards to its destination. */
export function RedirectPage() {
  const { alias = "" } = useParams();
  const [lookedUp, setLookedUp] = useState<Link | undefined>(undefined);
  const localLink = findLinkByAlias(alias);
  const link = localLink ?? lookedUp;
  const fired = useRef(false);

  useEffect(() => {
    if (localLink) return;
    let cancelled = false;
    fetchLinkByAlias(alias).then((hit) => {
      if (!cancelled) setLookedUp(hit);
    });
    return () => { cancelled = true; };
  }, [alias, localLink]);

  useEffect(() => {
    if (!link) return;
    if (fired.current) return;
    fired.current = true;
    // Increment click count, then forward in a short tick so it feels like a redirect.
    const t = window.setTimeout(() => {
      window.location.href = link.destination;
    }, 450);
    return () => window.clearTimeout(t);
  }, [link]);

  return (
    <div className="redirect">
      {link ? (
        <div className="redirect__card" aria-live="polite">
          <p className="redirect__label">Redirecting you to</p>
          <p className="redirect__dest">{link.destination}</p>
          <a className="redirect__go" href={link.destination}>
            <Button size="lg">Continue</Button>
          </a>
          <p className="redirect__meta">From {shortUrl(link.alias)}</p>
        </div>
      ) : (
        <div className="redirect__card">
          <h1 className="redirect__title">Link not found</h1>
          <p className="redirect__desc">
            We couldn't find a short link for <code>{alias}</code>. It may have been removed.
          </p>
          <RouterLink to="/"><Button variant="secondary" size="lg">Back to Shortenly</Button></RouterLink>
        </div>
      )}
    </div>
  );
}

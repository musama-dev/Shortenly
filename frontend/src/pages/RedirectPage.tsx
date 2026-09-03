import { useEffect, useState } from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import { findLinkByAlias, fetchLinkByAlias } from "../lib/links";
import { Button } from "../components/ui/Button";
import "./redirect.css";

/**
 * Client-side redirect for the in-app `#/r/:alias` route. Resolves the alias
 * and forwards the visitor to the destination immediately — no intermediate
 * "Redirecting…" screen and no artificial delay.
 */
export function RedirectPage() {
  const { alias = "" } = useParams();
  // undefined = still looking, null = not found, Link = resolved (redirects immediately)
  const [notFound, setNotFound] = useState(false);
  const localLink = findLinkByAlias(alias);

  useEffect(() => {
    if (localLink) {
      window.location.replace(localLink.destination);
      return;
    }
    let cancelled = false;
    fetchLinkByAlias(alias).then((hit) => {
      if (cancelled) return;
      if (hit) window.location.replace(hit.destination);
      else setNotFound(true);
    });
    return () => { cancelled = true; };
  }, [alias, localLink]);

  return (
    <div className="redirect">
      {notFound ? (
        <div className="redirect__card">
          <h1 className="redirect__title">Link not found</h1>
          <p className="redirect__desc">
            We couldn't find a short link for <code>{alias}</code>. It may have been removed.
          </p>
          <RouterLink to="/"><Button variant="secondary" size="lg">Back to Shortenly</Button></RouterLink>
        </div>
      ) : null}
    </div>
  );
}

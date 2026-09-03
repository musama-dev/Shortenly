import { useRef, useState } from "react";
import { normalizeUrl, createLink, makeAlias, shortUrl, registerLink, type Link } from "../lib/links";
import { Button } from "./ui/Button";
import { ArrowRight, Check, Copy } from "./icons";
import "./urlshortener.css";

type Phase = "idle" | "loading" | "done";

export function URLShortener({ onCreated }: { onCreated?: (l: Link) => void }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<Link | null>(null);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = () => {
    const normalized = normalizeUrl(value);
    if (!normalized) { setError("Enter a valid URL"); return; }
    setError(null);
    setPhase("loading");
    // Simulated network latency — replace with real API call.
    window.setTimeout(() => {
      const link = createLink(normalized, { alias: makeAlias(6) });
      registerLink(link);
      setResult(link);
      setPhase("done");
      onCreated?.(link);
    }, 650);
  };

  const copy = async () => {
    if (!result) return;
    try { await navigator.clipboard.writeText(shortUrl(result.alias)); } catch { /* noop */ }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const reset = () => {
    setResult(null); setPhase("idle"); setValue(""); setCopied(false);
    window.setTimeout(() => inputRef.current?.focus(), 50);
  };

  if (phase === "done" && result) {
    return (
      <div className="shortener shortener--done" aria-live="polite">
        <p className="shortener__eyebrow">Your link is ready</p>
        <a className="shortener__result" href={shortUrl(result.alias)}>{shortUrl(result.alias)}</a>
        <div className="shortener__actions">
          <Button onClick={copy} icon={copied ? <Check /> : <Copy />}>
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button variant="ghost" onClick={reset}>Shorten another</Button>
        </div>
        <div className="shortener__meta">
          <span>Destination · {result.destination.replace(/^https?:\/\//, "").slice(0, 48)}…</span>
        </div>
      </div>
    );
  }

  const hasValue = value.trim().length > 0;

  return (
    <div className="shortener">
      <form
        className={`shortener__box ${error ? "shortener__box--error" : ""}`}
        onSubmit={(e) => { e.preventDefault(); submit(); }}
      >
        <input
          ref={inputRef}
          className="shortener__input"
          type="text"
          inputMode="url"
          autoComplete="off"
          spellCheck={false}
          placeholder="Paste a long URL"
          aria-label="Paste a long URL"
          aria-invalid={!!error}
          value={value}
          onChange={(e) => { setValue(e.target.value); if (error) setError(null); }}
        />
        <Button size="lg" type="submit" loading={phase === "loading"} disabled={!hasValue}
          icon={!hasValue && phase !== "loading" ? undefined : <ArrowRight />}>
          {phase === "loading" ? "Shortening…" : "Shorten"}
        </Button>
      </form>
      {error && <p className="shortener__error" role="alert">{error}</p>}
      <p className="shortener__hint">Free forever · No sign-up required</p>
    </div>
  );
}

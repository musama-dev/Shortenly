import { useState } from "react";
import { Wordmark } from "../Logo";
import { URLShortener } from "../URLShortener";
import { Chart } from "../Chart";
import { Button } from "../ui/Button";
import { Sun, Moon, ChevronDown, Zap, Shield, Chart as ChartIcon, LinkIcon, QrCode, Code, ArrowRight } from "../icons";
import { useTheme } from "../../lib/theme";
import { demoLinks } from "../../lib/links";
import "./landing.css";

const NAV = [
  { label: "Features", href: "#features" },
  { label: "Analytics", href: "#analytics" },
  { label: "API", href: "#api" },
  { label: "GitHub", href: "https://github.com/example/shortenly" },
];

function ThemeToggle() {
  const { resolved, setTheme } = useTheme();
  const next = resolved === "dark" ? "light" : "dark";
  return (
    <button className="landing__theme-toggle" onClick={() => setTheme(next)}
      aria-label={`Switch to ${next} mode`}>
      {resolved === "dark" ? <Sun /> : <Moon />}
    </button>
  );
}

function FAQ({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq ${open ? "faq--open" : ""}`}>
      <button className="faq__q" onClick={() => setOpen(!open)} aria-expanded={open}>
        {q}
        <ChevronDown className="faq__chevron" />
      </button>
      {open && <p className="faq__a">{a}</p>}
    </div>
  );
}

export function LandingPage() {
  const preview = demoLinks[0];
  return (
    <div className="landing">
      {/* Header */}
      <header className="landing__header">
        <div className="container landing__header-inner">
          <a href="#" className="landing__logo" aria-label="Shortenly home"><Wordmark /></a>
          <nav className="landing__nav" aria-label="Main">
            {NAV.map((n) => <a key={n.href} href={n.href}>{n.label}</a>)}
          </nav>
          <div className="landing__header-actions">
            <ThemeToggle />
            <a href="/app" className="landing__open">Open the app</a>
            <a href="https://github.com/example/shortenly">
              <Button size="sm" variant="secondary">GitHub</Button>
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main>
        <section className="landing__hero">
          <div className="container">
            <h1 className="landing__headline">Short links.<br />Beautifully simple.</h1>
            <p className="landing__sub">
              Turn long URLs into short, memorable links — with powerful analytics when you need them.
            </p>
            <URLShortener />
          </div>
        </section>

        {/* Trust */}
        <section className="landing__trust">
          <div className="container landing__trust-grid">
            {[
              { icon: <Zap />, t: "Fast", d: "Redirects built for speed." },
              { icon: <Shield />, t: "Private", d: "Analytics designed responsibly." },
              { icon: <ChartIcon />, t: "Powerful", d: "Track every important click." },
            ].map((f) => (
              <div key={f.t} className="landing__trust-item">
                <span className="landing__trust-icon">{f.icon}</span>
                <h3>{f.t}</h3>
                <p>{f.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Analytics showcase */}
        <section className="landing__section" id="analytics">
          <div className="container">
            <h2 className="landing__section-title">One link. Complete visibility.</h2>
            <p className="landing__section-sub">
              Understand where your links are being clicked without drowning in data.
            </p>
            <div className="landing__showcase landing__showcase--analytics">
              <div className="landing__showcase-head">
                <div>
                  <p className="landing__showcase-label">Total clicks</p>
                  <p className="landing__showcase-value">12,482</p>
                </div>
                <span className="landing__delta">+18.4%</span>
              </div>
              <Chart data={preview.clicksByDay} height={180} labels={["Aug 4", "Aug 14", "Aug 24", "Sep 2"]} />
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="landing__section" id="features">
          <div className="container landing__features">
            {[
              { icon: <LinkIcon />, t: "Custom links", d: "Choose your own memorable alias — sho.rt/summer reads better than a random string." },
              { icon: <QrCode />, t: "Beautiful QR codes", d: "Every link comes with a matching QR code, ready for print and packaging." },
              { icon: <Code />, t: "Simple API", d: "Create and manage links programmatically with a clean, predictable API." },
            ].map((f) => (
              <div key={f.t} className="landing__feature">
                <span className="landing__feature-icon">{f.icon}</span>
                <div>
                  <h3>{f.t}</h3>
                  <p>{f.d}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* API */}
        <section className="landing__section landing__section--alt" id="api">
          <div className="container landing__api">
            <div>
              <h2 className="landing__section-title">Built for developers</h2>
            <p className="landing__section-sub">
              One request. One short link. Predictable responses, sensible errors.
            </p>
            <a href="https://github.com/example/shortenly" className="landing__link">Read the docs <ArrowRight width={14} height={14} /></a>
            </div>
            <pre className="landing__code"><code>{`curl -X POST https://api.sho.rt/v1/links \
  -d '{ "url": "https://example.com/very/long/path" }'

# { "short_url": "https://sho.rt/aB92xK" }`}</code></pre>
          </div>
        </section>

        {/* Open source */}
        <section className="landing__section" id="open-source">
          <div className="container">
            <h2 className="landing__section-title">Free, forever. Built in the open.</h2>
            <p className="landing__section-sub">
              Shortenly is an open-source project from the university community — no accounts, no paywalls, no limits.
            </p>
            <div className="landing__oss">
              <div className="landing__oss-card">
                <h3>Self-host it</h3>
                <p>Deploy Shortenly on your own infrastructure with a single container. The full source is on GitHub.</p>
              </div>
              <div className="landing__oss-card">
                <h3>Contribute</h3>
                <p>Built by students, for students. Open issues, friendly pull requests, and a welcoming community.</p>
              </div>
              <div className="landing__oss-card">
                <h3>No strings attached</h3>
                <p>No account required. Paste a URL, get a link, move on with your day.</p>
              </div>
            </div>
            <div className="landing__oss-cta">
              <a href="https://github.com/example/shortenly"><Button variant="secondary" size="lg">View on GitHub <ArrowRight width={15} height={15} /></Button></a>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="landing__section">
          <div className="container landing__faq">
            <h2 className="landing__section-title">Questions</h2>
            {[
              { q: "What is a shortened URL?", a: "A shortened URL is a compact redirect that points to a longer destination. Easier to share, nicer to look at, and measurable." },
              { q: "Do links expire?", a: "Only if you want them to. Links are permanent by default; you can set an optional expiration date on any link." },
              { q: "Can I customize my links?", a: "Yes. Pick your own alias like sho.rt/summer." },
              { q: "Can I track clicks?", a: "Every link includes click counts, referrers, locations, and devices — presented plainly." },
              { q: "Do you support QR codes?", a: "Every short link comes with a downloadable QR code in PNG and SVG." },
              { q: "Is there an API?", a: "Yes — a small, predictable REST API so you can create links programmatically." },
            ].map((f) => <FAQ key={f.q} {...f} />)}
          </div>
        </section>

        {/* Final CTA */}
        <section className="landing__cta">
          <div className="container landing__cta-inner">
            <h2>Shorten your first link.</h2>
            <p>No account, no cost, no limits.</p>
            <a href="#top"><Button variant="secondary" size="lg" icon={<ArrowRight />}>Try it above</Button></a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="landing__footer">
        <div className="container landing__footer-grid">
          {[
            { h: "Product", links: ["Features", "Analytics", "API", "QR Codes"] },
            { h: "Community", links: ["GitHub", "Contribute", "Issues", "Code of Conduct"] },
            { h: "Legal", links: ["Privacy", "Terms", "License"] },
          ].map((c) => (
            <div key={c.h}>
              <h4>{c.h}</h4>
              {c.links.map((l) => <a key={l} href="#">{l}</a>)}
            </div>
          ))}
        </div>
        <div className="container landing__footer-bottom">
          <Wordmark />
          <span>© 2026 Shortenly</span>
        </div>
      </footer>
    </div>
  );
}

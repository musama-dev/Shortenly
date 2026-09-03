import { useState } from "react";
import { demoLinks, shortUrl } from "../../lib/links";
import { Chart } from "../../components/Chart";
import { RowList, Metric } from "../../components/ui/misc";

const fmt = (n: number) => n.toLocaleString("en-US");
const TABS = ["Overview", "Traffic", "Locations", "Devices", "Referrers"] as const;
type Tab = (typeof TABS)[number];

export function AnalyticsPage() {
  const [tab, setTab] = useState<Tab>("Overview");
  const totals = demoLinks.reduce((s, l) => s + l.clicks, 0);
  const series = demoLinks[0].clicksByDay.map((_, i) =>
    demoLinks.reduce((s, l) => s + l.clicksByDay[i], 0));
  const top = demoLinks[0];
  const maxC = Math.max(...top.topCountries.map((c) => c.clicks), 1);
  const maxR = Math.max(...top.topReferrers.map((c) => c.clicks), 1);

  return (
    <div className="page">
      <header className="page__head">
        <h1 className="page__title">Analytics</h1>
      </header>

      <section className="page__metrics page__metrics--wide">
        <Metric value={fmt(totals)} label="Total clicks" delta="+18.4%" />
        <Metric value="3,412" label="Last 30 days" delta="+6.1%" />
        <Metric value="2:14" label="Avg. time to redirect" />
      </section>

      <nav className="tabs" role="tablist" aria-label="Analytics sections">
        {TABS.map((t) => (
          <button key={t} role="tab" aria-selected={tab === t}
            className={`tabs__tab ${tab === t ? "tabs__tab--active" : ""}`}
            onClick={() => setTab(t)}>{t}</button>
        ))}
      </nav>

      <section className="page__card">
        {(tab === "Overview" || tab === "Traffic") && (
          <Chart data={series} height={220} labels={["Aug 4", "Aug 14", "Aug 24", "Sep 2"]} />
        )}
        {tab === "Locations" && (
          <RowList items={top.topCountries.map((c) => ({ name: c.name, value: fmt(c.clicks), share: (c.clicks / maxC) * 100 }))} />
        )}
        {tab === "Referrers" && (
          <RowList items={top.topReferrers.map((c) => ({ name: c.name, value: fmt(c.clicks), share: (c.clicks / maxR) * 100 }))} />
        )}
        {tab === "Devices" && (
          <RowList items={top.devices.map((d) => ({ name: d.name, value: `${d.share}%`, share: d.share }))} />
        )}
      </section>

      <section className="page__section">
        <h2 className="page__h2">Top links</h2>
        <ul className="minilist">
          {[...demoLinks].sort((a, b) => b.clicks - a.clicks).slice(0, 5).map((l) => (
            <li key={l.id} className="minilist__row">
              <span className="minilist__alias">{shortUrl(l.alias)}</span>
              <span className="minilist__title">{l.title}</span>
              <span className="minilist__clicks">{fmt(l.clicks)} clicks</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

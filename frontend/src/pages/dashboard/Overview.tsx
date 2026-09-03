import { useMemo } from "react";
import { allLinks, shortUrl } from "../../lib/links";
import { Chart } from "../../components/Chart";
import { Button } from "../../components/ui/Button";
import { Metric, Badge } from "../../components/ui/misc";
import { ArrowUpRight, Plus } from "../../components/icons";
import { Link, useNavigate } from "react-router-dom";

const hour = new Date().getHours();
const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

export function Overview() {
  const navigate = useNavigate();
  const totals = useMemo(() => {
    const list = allLinks();
    const clicks = list.reduce((s, l) => s + l.clicks, 0);
    const series = (list[0]?.clicksByDay ?? []).map((_, i) =>
      list.reduce((s, l) => s + (l.clicksByDay[i] ?? 0), 0));
    return { clicks, series, active: list.filter((l) => l.status === "active").length };
  }, []);

  const recent = allLinks().slice(0, 4);

  return (
    <div className="page">
      <header className="page__head">
        <div>
          <h1 className="page__title">{greeting}</h1>
          <p className="page__sub">Your links are working beautifully.</p>
        </div>
        <Link to="/app/links"><Button size="sm" icon={<Plus />}>Create link</Button></Link>
      </header>

      <section className="page__metrics">
        <Metric value={totals.clicks.toLocaleString("en-US")} label="Total clicks" delta="+18.4%" />
        <Metric value={String(totals.active)} label="Active links" />
        <Metric value="6" label="Links created this week" />
      </section>

      <section className="page__section">
        <div className="page__card">
          <div className="page__card-head">
            <h2>Clicks · last 30 days</h2>
          </div>
          <Chart data={totals.series} height={180} labels={["Aug 4", "Aug 14", "Aug 24", "Sep 2"]} />
        </div>
      </section>

      <section className="page__section">
        <div className="page__section-head">
          <h2>Recent links</h2>
          <Link to="/app/links" className="page__link">View all <ArrowUpRight width={13} height={13} /></Link>
        </div>
        <ul className="minilist">
          {recent.map((l) => (
            <li key={l.id}>
              <div
                role="link"
                tabIndex={0}
                className="minilist__row"
                onClick={() => navigate(`/app/links/${l.id}`)}
                onKeyDown={(e) => { if (e.key === "Enter") navigate(`/app/links/${l.id}`); }}
              >
                <div>
                  <a className="minilist__alias" href={shortUrl(l.alias)} onClick={(e) => e.stopPropagation()}>
                    {shortUrl(l.alias).replace(/^https?:\/\//, "")}
                  </a>
                  <span className="minilist__title">{l.title}</span>
                </div>
                <div className="minilist__right">
                  <span className="minilist__clicks">{l.clicks.toLocaleString("en-US")} clicks</span>
                  <Badge status={l.status} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

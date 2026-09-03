import { useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { allLinks, shortUrl } from "../../lib/links";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { Badge, RowList } from "../../components/ui/misc";
import { Chart } from "../../components/Chart";
import { Check, Copy, QrCode, Trash, ArrowLeft } from "../../components/icons";
import { QrPreview } from "./QrPreview";

const fmt = (n: number) => n.toLocaleString("en-US");

export function LinkDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const list = allLinks();
  const link = list.find((l) => l.id === id) ?? list[0];
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [tab, setTab] = useState<"traffic" | "locations" | "devices" | "referrers">("traffic");

  const copy = async () => {
    try { await navigator.clipboard.writeText(shortUrl(link.alias)); } catch { /* noop */ }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const referrers = useMemo(() => {
    const max = Math.max(...link.topReferrers.map((r) => r.clicks), 1);
    return link.topReferrers.map((r) => ({ name: r.name, value: fmt(r.clicks), share: (r.clicks / max) * 100 }));
  }, [link]);
  const countries = useMemo(() => {
    const max = Math.max(...link.topCountries.map((r) => r.clicks), 1);
    return link.topCountries.map((r) => ({ name: r.name, value: fmt(r.clicks), share: (r.clicks / max) * 100 }));
  }, [link]);

  return (
    <div className="page">
      <Link to="/app/links" className="page__back"><ArrowLeft width={14} height={14} /> All links</Link>

      <header className="page__head page__head--detail">
        <div>
          <h1 className="page__title">{link.title}</h1>
          <a className="page__shortlink" href={shortUrl(link.alias)}>{shortUrl(link.alias)}</a>
        </div>
        <div className="page__actions">
          <Button size="sm" variant="secondary" onClick={() => setConfirmDelete(true)} icon={<Trash />}>Delete</Button>
          <Button size="sm" variant="secondary" icon={<QrCode />}>QR Code</Button>
          <Button size="sm" onClick={copy} icon={copied ? <Check /> : <Copy />}>{copied ? "Copied" : "Copy link"}</Button>
        </div>
      </header>

      <div className="page__dest">
        <span>Destination</span>
        <p>{link.destination}</p>
      </div>

      <section className="page__card">
        <div className="page__card-head">
          <h2>Clicks · last 30 days</h2>
          <span className="page__card-total">{fmt(link.clicks)} total</span>
        </div>
        <Chart data={link.clicksByDay} height={200} labels={["Aug 4", "Aug 14", "Aug 24", "Sep 2"]} />
      </section>

      <section className="page__section">
        <div className="tabs" role="tablist">
          {(["traffic", "locations", "devices", "referrers"] as const).map((t) => (
            <button key={t} role="tab" aria-selected={tab === t}
              className={`tabs__tab ${tab === t ? "tabs__tab--active" : ""}`}
              onClick={() => setTab(t)}>
              {t[0].toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        <div className="page__card">
          {tab === "traffic" && <Chart data={link.clicksByDay} height={160} />}
          {tab === "locations" && <RowList items={countries} />}
          {tab === "referrers" && <RowList items={referrers} />}
          {tab === "devices" && (
            <RowList items={link.devices.map((d) => ({ name: d.name, value: `${d.share}%`, share: d.share }))} />
          )}
        </div>
      </section>

      <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Delete this link?" width={400}
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmDelete(false)}>Cancel</Button>
            <Button variant="danger" onClick={() => { setConfirmDelete(false); navigate("/app/links"); }}>Delete</Button>
          </>
        }>
        <p className="page__confirm-text">This link will stop working permanently.</p>
        <div style={{ marginTop: 12 }}><Badge status="active" /></div>
      </Modal>

      <QrPreview alias={link.alias} />
    </div>
  );
}

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { allLinks, shortUrl } from "../../lib/links";
import { Button } from "../../components/ui/Button";
import { Badge, EmptyState, Segmented, Tooltip } from "../../components/ui/misc";
import { Search, Plus, Dots, ExternalLink } from "../../components/icons";
import { CreateLinkModal } from "../../components/dashboard/CreateLinkModal";

type Filter = "all" | "active" | "expired" | "disabled";

export function LinksPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [createOpen, setCreateOpen] = useState(false);

  const links = useMemo(() =>
    allLinks()
      .filter((l) => filter === "all" || l.status === filter)
      .filter((l) => (l.title + l.alias + l.destination).toLowerCase().includes(query.toLowerCase())),
  [query, filter]);

  return (
    <div className="page">
      <header className="page__head">
        <h1 className="page__title">Links</h1>
        <Button size="sm" icon={<Plus />} onClick={() => setCreateOpen(true)}>Create link</Button>
      </header>

      <div className="page__toolbar">
        <div className="searchbox">
          <Search width={14} height={14} />
          <input type="search" placeholder="Search links" value={query}
            onChange={(e) => setQuery(e.target.value)} aria-label="Search links" />
        </div>
        <Segmented<Filter>
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "All" },
            { value: "active", label: "Active" },
            { value: "expired", label: "Expired" },
            { value: "disabled", label: "Disabled" },
          ]}
        />
      </div>

      {links.length === 0 ? (
        <EmptyState
          title="No links found"
          body={query || filter !== "all"
            ? "Try a different search or filter."
            : "Create your first short link and start sharing."}
          action={<Button size="sm" icon={<Plus />} onClick={() => setCreateOpen(true)}>Create link</Button>}
        />
      ) : (
        <div className="linktable" role="table" aria-label="Links">
          {links.map((l) => (
            <div
              key={l.id}
              role="row"
              tabIndex={0}
              className="linktable__row"
              onClick={() => navigate(`/app/links/${l.id}`)}
              onKeyDown={(e) => { if (e.key === "Enter") navigate(`/app/links/${l.id}`); }}
            >
              <div className="linktable__main">
                <a className="linktable__alias" href={shortUrl(l.alias)} onClick={(e) => e.stopPropagation()}>
                  {shortUrl(l.alias)}
                </a>
                <span className="linktable__title">{l.title}</span>
                <span className="linktable__dest">{l.destination.replace(/^https?:\/\//, "")}</span>
              </div>
              <div className="linktable__meta">
                <span className="linktable__clicks">{l.clicks.toLocaleString("en-US")} clicks</span>
                <Badge status={l.status} />
                <Tooltip label="Open destination">
                  <span className="linktable__ext" onClick={(e) => { e.preventDefault(); window.open(l.destination, "_blank"); }}>
                    <ExternalLink width={14} height={14} />
                  </span>
                </Tooltip>
                <span className="linktable__dots" aria-hidden><Dots width={14} height={14} /></span>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateLinkModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}

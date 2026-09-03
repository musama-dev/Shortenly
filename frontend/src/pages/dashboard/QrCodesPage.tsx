import { demoLinks } from "../../lib/links";
import { QrPreview } from "./QrPreview";

export function QrCodesPage() {
  return (
    <div className="page">
      <header className="page__head">
        <h1 className="page__title">QR Codes</h1>
      </header>
      <div className="qrgrid">
        {demoLinks.slice(0, 4).map((l) => (
          <div key={l.id} className="page__card qrgrid__item">
            <QrPreview alias={l.alias} />
          </div>
        ))}
      </div>
    </div>
  );
}

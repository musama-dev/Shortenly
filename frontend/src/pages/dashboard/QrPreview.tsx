import { QRCodeSVG } from "qrcode.react";
import { shortUrl } from "../../lib/links";
import "./qrpreview.css";

/** Premium QR preview — print-quality, downloadable. */
export function QrPreview({ alias }: { alias: string }) {
  // Encodes the shareable short URL. In deployment (VITE_BASE_URL set) this is a
  // clean {base}/alias that the node server redirects; in dev it falls back to the
  // in-app hash route so scanning still works.
  const url = shortUrl(alias);
  const download = (type: "png" | "svg") => {
    const svgEl = document.querySelector<SVGSVGElement>("#qr-code");
    if (!svgEl) return;
    if (type === "svg") {
      const blob = new Blob([new XMLSerializer().serializeToString(svgEl)], { type: "image/svg+xml" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `sho-rt-${alias}.svg`;
      a.click();
      URL.revokeObjectURL(a.href);
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = 512; canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, 512, 512);
    const img = new Image();
    const svgData = new XMLSerializer().serializeToString(svgEl);
    img.onload = () => { ctx.drawImage(img, 0, 0, 512, 512); const a = document.createElement("a"); a.href = canvas.toDataURL("image/png"); a.download = `sho-rt-${alias}.png`; a.click(); };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <div className="qr" id="qr-panel">
      <div className="qr__frame">
        <QRCodeSVG id="qr-code" value={url} size={180} level="M"
          bgColor="var(--bg-elevated)" fgColor="var(--text-primary)"
          marginSize={2} />
      </div>
      <p className="qr__url" title={url}>{url.replace(/^https?:\/\//, "")}</p>
      <div className="qr__actions">
        <button className="qr__btn" onClick={() => download("png")}>Download PNG</button>
        <button className="qr__btn" onClick={() => download("svg")}>Download SVG</button>
      </div>
    </div>
  );
}

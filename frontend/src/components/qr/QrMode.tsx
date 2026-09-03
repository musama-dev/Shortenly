import { useCallback, useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { shortUrl } from "../../lib/links";
import { useTheme } from "../../lib/theme";
import { Button } from "../ui/Button";
import { X, Copy, Check, Download, Share, Refresh } from "../icons";
import "./qrmode.css";

interface Props {
  alias: string;
  open: boolean;
  onClose: () => void;
}

/**
 * QR Mode — a first-class, full-screen premium experience.
 *
 * Entrance: backdrop fades, card scales up on a spring curve, controls
 * stagger in. Exit reverses it and restores the exact scroll position.
 * QR colors track the active theme; scannability is never compromised
 * (level M, 2-module quiet zone, high-contrast pair only).
 */
export function QrMode({ alias, open, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [nonce, setNonce] = useState(0);
  const [render, setRender] = useState(false); // keeps DOM mounted during exit animation
  const [closing, setClosing] = useState(false);
  const scrollY = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const { resolved } = useTheme();

  const url = shortUrl(alias);

  // Mount/unmount with exit animation + scroll lock/restore
  useEffect(() => {
    if (open) {
      scrollY.current = window.scrollY;
      setRender(true);
      setClosing(false);
      document.body.style.overflow = "hidden";
      return;
    }
    if (!render) return;
    setClosing(true);
    const t = window.setTimeout(() => {
      setRender(false);
      document.body.style.overflow = "";
      window.scrollTo({ top: scrollY.current, behavior: "instant" as ScrollBehavior });
    }, reduced() ? 0 : 260);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const copy = useCallback(async () => {
    try { await navigator.clipboard.writeText(url); } catch { /* noop */ }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }, [url]);

  const share = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Shortenly link", url });
        return;
      } catch { /* user cancelled — fall through to copy */ }
    }
    copy();
    setShared(true);
    window.setTimeout(() => setShared(false), 1600);
  }, [url, copy]);

  const downloadPng = useCallback(() => {
    const svgEl = cardRef.current?.querySelector<SVGSVGElement>(".qrmode__qr svg");
    if (!svgEl) return;
    const canvas = document.createElement("canvas");
    canvas.width = 1024; canvas.height = 1024;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const img = new Image();
    const data = new XMLSerializer().serializeToString(svgEl);
    img.onload = () => {
      const pad = 96;
      ctx.drawImage(img, pad, pad, canvas.width - pad * 2, canvas.height - pad * 2);
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = `sho-rt-${alias}.png`;
      a.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(data)));
  }, [alias]);

  if (!render) return null;

  return (
    <div
      className={`qrmode ${closing ? "qrmode--closing" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label={`QR code for ${url}`}
    >
      <div className="qrmode__backdrop" onClick={onClose} aria-hidden />

      <div className="qrmode__card" ref={cardRef}>
        <button className="qrmode__close" onClick={onClose} aria-label="Close QR Mode"><X /></button>

        <p className="qrmode__eyebrow">QR Mode</p>
        <h2 className="qrmode__title">Scan to open</h2>

        <div className="qrmode__qr" data-testid="qr-code">
          <QRCodeSVG
            key={`${nonce}-${resolved}`}
            value={url}
            size={224}
            level="M"
            marginSize={3}
            bgColor={resolved === "dark" ? "#ffffff" : "#ffffff"}
            fgColor={resolved === "dark" ? "#111111" : "#18181b"}
          />
        </div>

        <p className="qrmode__url" title={url}>{url.replace(/^https?:\/\//, "")}</p>

        <div className="qrmode__actions">
          <Button onClick={copy} icon={copied ? <Check /> : <Copy />}>{copied ? "Copied" : "Copy link"}</Button>
          <Button variant="secondary" onClick={downloadPng} icon={<Download />}>Download</Button>
          <Button variant="ghost" onClick={share} icon={shared ? <Check /> : <Share />}>{shared ? "Copied" : "Share"}</Button>
          <Button variant="ghost" onClick={() => setNonce(n => n + 1)} icon={<Refresh />} aria-label="Regenerate QR code">
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );
}

function reduced() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

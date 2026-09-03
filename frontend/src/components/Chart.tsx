import { useMemo, useState } from "react";
import "./chart.css";

interface Props {
  data: number[];
  height?: number;
  labels?: string[];
}

/** Minimal, elegant SVG area chart — no chart library needed. */
export function Chart({ data, height = 200, labels }: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 600;
  const H = height;
  const PAD = 8;

  const { path, area, points, max } = useMemo(() => {
    const max = Math.max(...data, 1);
    const step = (W - PAD * 2) / (data.length - 1 || 1);
    const pts = data.map((v, i) => ({
      x: PAD + i * step,
      y: PAD + (1 - v / max) * (H - PAD * 2),
      v,
    }));
    // Smooth line with quadratic midpoints
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1], cur = pts[i];
      const mx = (prev.x + cur.x) / 2;
      d += ` Q ${mx} ${prev.y} ${mx} ${(prev.y + cur.y) / 2} T ${cur.x} ${cur.y}`;
    }
    const areaD = `${d} L ${pts[pts.length - 1].x} ${H} L ${pts[0].x} ${H} Z`;
    return { path: d, area: areaD, points: pts, max };
  }, [data, H]);

  const fmt = (n: number) => n.toLocaleString("en-US");

  return (
    <div className="chart">
      <svg viewBox={`0 0 ${W} ${H}`} className="chart__svg" preserveAspectRatio="none"
        onMouseLeave={() => setHover(null)} role="img" aria-label="Clicks over time">
        <defs>
          <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.12" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1={0} x2={W} y1={PAD + f * (H - PAD * 2)} y2={PAD + f * (H - PAD * 2)}
            className="chart__grid" />
        ))}
        <path d={area} fill="url(#chartFill)" className="chart__area" />
        <path d={path} fill="none" className="chart__line" />
        {hover !== null && (
          <>
            <line x1={points[hover].x} x2={points[hover].x} y1={PAD} y2={H} className="chart__cursor" />
            <circle cx={points[hover].x} cy={points[hover].y} r={4} className="chart__dot" />
          </>
        )}
        {/* invisible hover columns */}
        {points.map((p, i) => (
          <rect key={i} x={p.x - (W / data.length) / 2} y={0} width={W / data.length} height={H}
            fill="transparent" onMouseEnter={() => setHover(i)} />
        ))}
      </svg>
      {hover !== null && (
        <div className="chart__tooltip" role="status">
          <span className="chart__tooltip-value">{fmt(points[hover].v)} clicks</span>
        </div>
      )}
      {labels && (
        <div className="chart__xlabels">
          {labels.map((l) => <span key={l}>{l}</span>)}
        </div>
      )}
      <span className="sr-only">Maximum {fmt(max)} clicks per day</span>
    </div>
  );
}

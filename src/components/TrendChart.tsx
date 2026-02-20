/**
 * Minimal SVG line chart — server-component-safe (no JS runtime).
 * Renders a responsive trend line with labelled axes.
 */
import type { RiskTrendPoint } from "@/lib/exec-dashboard";

interface TrendChartProps {
  data: RiskTrendPoint[];
  /** "compliance" shows avgComplianceScore; "risk" shows overallRiskScore */
  metric?: "compliance" | "risk";
  height?: number;
  className?: string;
}

export default function TrendChart({
  data,
  metric = "compliance",
  height = 180,
  className,
}: TrendChartProps) {
  if (data.length < 2) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
        Not enough data for trend chart
      </div>
    );
  }

  const width = 600;
  const pad = { top: 16, right: 12, bottom: 28, left: 36 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  const values = data.map((d) =>
    metric === "compliance" ? d.avgComplianceScore : d.overallRiskScore,
  );
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const stepX = innerW / (data.length - 1);

  const coords = values.map((v, i) => ({
    x: pad.left + i * stepX,
    y: pad.top + innerH - ((v - min) / range) * innerH,
  }));

  const polyline = coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ");
  const fillPoly = `${coords[0].x.toFixed(1)},${pad.top + innerH} ${polyline} ${coords[coords.length - 1].x.toFixed(1)},${pad.top + innerH}`;

  const color = metric === "compliance" ? "#22c55e" : "#ef4444";
  const gradId = `trend-grad-${metric}`;

  // Y-axis ticks (5 ticks)
  const yTicks = Array.from({ length: 5 }, (_, i) => {
    const v = min + (range * i) / 4;
    return {
      value: Math.round(v),
      y: pad.top + innerH - (i / 4) * innerH,
    };
  });

  // X-axis labels — show ~5 evenly spaced dates
  const labelCount = Math.min(5, data.length);
  const xLabels = Array.from({ length: labelCount }, (_, i) => {
    const idx = Math.round((i / (labelCount - 1)) * (data.length - 1));
    const d = data[idx];
    const [, m, day] = d.date.split("-");
    return {
      label: `${day}/${m}`,
      x: pad.left + idx * stepX,
    };
  });

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={`w-full ${className ?? ""}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.2} />
          <stop offset="100%" stopColor={color} stopOpacity={0.01} />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {yTicks.map((t) => (
        <line
          key={t.value}
          x1={pad.left}
          y1={t.y}
          x2={width - pad.right}
          y2={t.y}
          stroke="#e5e7eb"
          strokeWidth={0.5}
        />
      ))}

      {/* Fill area */}
      <polygon points={fillPoly} fill={`url(#${gradId})`} />

      {/* Line */}
      <polyline
        points={polyline}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Y labels */}
      {yTicks.map((t) => (
        <text
          key={t.value}
          x={pad.left - 6}
          y={t.y + 3}
          textAnchor="end"
          fontSize={10}
          fill="#9ca3af"
        >
          {t.value}%
        </text>
      ))}

      {/* X labels */}
      {xLabels.map((l, i) => (
        <text
          key={i}
          x={l.x}
          y={height - 4}
          textAnchor="middle"
          fontSize={10}
          fill="#9ca3af"
        >
          {l.label}
        </text>
      ))}
    </svg>
  );
}

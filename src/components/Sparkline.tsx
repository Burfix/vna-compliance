/**
 * Tiny SVG sparkline — server-component-safe (no client JS required).
 * Renders an 80×24 SVG polyline with optional gradient fill.
 */

interface SparklineProps {
  points: number[];
  width?: number;
  height?: number;
  /** stroke colour — any CSS colour */
  color?: string;
  /** show a translucent fill below the line */
  fill?: boolean;
  className?: string;
}

export default function Sparkline({
  points,
  width = 80,
  height = 24,
  color = "#3b82f6",
  fill = true,
  className,
}: SparklineProps) {
  if (points.length < 2) return null;

  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1; // avoid divide-by-zero

  const pad = 1; // small padding so line doesn't clip
  const innerH = height - pad * 2;
  const stepX = (width - 2) / (points.length - 1);

  const coords = points.map((v, i) => ({
    x: 1 + i * stepX,
    y: pad + innerH - ((v - min) / range) * innerH,
  }));

  const polyline = coords.map((c) => `${c.x},${c.y}`).join(" ");

  // Closed polygon for fill area
  const fillPoly = fill
    ? `${coords[0].x},${height} ${polyline} ${coords[coords.length - 1].x},${height}`
    : undefined;

  const id = `spark-${Math.random().toString(36).slice(2, 8)}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      aria-hidden
    >
      {fill && (
        <>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.25} />
              <stop offset="100%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <polygon points={fillPoly} fill={`url(#${id})`} />
        </>
      )}
      <polyline
        points={polyline}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Dot on the last (current) point */}
      <circle
        cx={coords[coords.length - 1].x}
        cy={coords[coords.length - 1].y}
        r={2}
        fill={color}
      />
    </svg>
  );
}

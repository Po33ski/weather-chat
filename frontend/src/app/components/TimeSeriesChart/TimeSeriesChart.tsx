import { useId, useMemo, useState, type KeyboardEvent, type PointerEvent } from "react";
import { useElementWidth } from "@/app/hooks/useElementWidth";
import {
  bandPath,
  columnPath,
  extent,
  extremeIndex,
  labelStride,
  linearScale,
  linePath,
  niceTicks,
  type Point,
} from "@/app/utils/chartScale";

export interface ChartSeries {
  id: string;
  label: string;
  // CSS color (a chart token such as "var(--chart-warm)").
  color: string;
  values: (number | null)[];
}

export interface ChartPoint {
  label: string;
  fullLabel: string;
  detail?: string;
}

const MARGIN = { top: 28, right: 16, bottom: 30, left: 44 };
const MAX_BAR_WIDTH = 24;
const TOOLTIP_OFFSET = 14;
const TOOLTIP_WIDTH = 176;
const muted = "rgb(var(--ink-muted))";
const secondary = "rgb(var(--ink-secondary))";

/**
 * Single-axis daily chart (line or column) sized to its container in real
 * pixels. Values a tooltip shows are also listed in the day-by-day table, so
 * hover only enhances. Direct labels mark the extremes only.
 */
export function TimeSeriesChart({
  type,
  points,
  series,
  band,
  formatValue,
  formatTick = formatValue,
  domain,
  zeroBased = false,
  ariaLabel,
  hint,
  height = 248,
}: {
  type: "line" | "bar";
  points: ChartPoint[];
  series: ChartSeries[];
  band?: { lower: (number | null)[]; upper: (number | null)[] };
  formatValue: (value: number) => string;
  formatTick?: (value: number) => string;
  domain?: [number, number];
  zeroBased?: boolean;
  ariaLabel: string;
  hint: string;
  height?: number;
}) {
  const [containerRef, width] = useElementWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);
  const hintId = useId();
  const count = points.length;

  const geometry = useMemo(() => {
    const plotWidth = Math.max(0, width - MARGIN.left - MARGIN.right);
    const plotHeight = height - MARGIN.top - MARGIN.bottom;
    const values = [...series.flatMap((s) => s.values), ...(band ? [...band.lower, ...band.upper] : [])];
    const [dataLo, hi] = domain ?? extent(values) ?? [0, 1];
    const ticks = niceTicks(zeroBased ? Math.min(0, dataLo) : dataLo, hi, 5);
    const yMin = ticks[0];
    const yMax = ticks[ticks.length - 1];
    const y = linearScale([yMin, yMax], [MARGIN.top + plotHeight, MARGIN.top]);
    const step = count ? plotWidth / count : 0;
    const x = (index: number) => MARGIN.left + step * (index + 0.5);
    const toPoints = (vals: (number | null)[]): (Point | null)[] =>
      vals.map((v, i) => (v === null ? null : { x: x(i), y: y(v) }));
    return { plotWidth, plotHeight, ticks, y, x, step, toPoints, baseline: y(Math.max(yMin, 0)) };
  }, [width, height, series, band, domain, zeroBased, count]);

  const { plotWidth, plotHeight, ticks, y, x, step, toPoints, baseline } = geometry;
  const stride = labelStride(count, plotWidth);
  const barWidth = Math.min(MAX_BAR_WIDTH, step * 0.56);

  // Selective direct labels: the first series' peak, and the last series' low
  // (for a single line series both ends of its range).
  const labels: { index: number; value: number; seriesIndex: number; position: "above" | "below" }[] = [];
  const first = series[0];
  const last = series[series.length - 1];
  const maxIndex = first ? extremeIndex(first.values, "max") : null;
  if (first && maxIndex !== null) {
    labels.push({ index: maxIndex, value: first.values[maxIndex] as number, seriesIndex: 0, position: "above" });
  }
  if (type === "line" && last) {
    const minIndex = extremeIndex(last.values, "min");
    if (minIndex !== null && !(series.length === 1 && minIndex === maxIndex)) {
      labels.push({
        index: minIndex,
        value: last.values[minIndex] as number,
        seriesIndex: series.length - 1,
        position: "below",
      });
    }
  }

  const setFromPointer = (event: PointerEvent<SVGSVGElement>) => {
    if (!step) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const index = Math.floor((event.clientX - rect.left - MARGIN.left) / step);
    setActive(Math.min(count - 1, Math.max(0, index)));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const keys: Record<string, (current: number) => number> = {
      ArrowRight: (c) => Math.min(count - 1, c + 1),
      ArrowLeft: (c) => Math.max(0, c - 1),
      Home: () => 0,
      End: () => count - 1,
    };
    const key = event.key;
    if (key === "Escape") {
      setActive(null);
    } else if (key in keys) {
      event.preventDefault();
      // The first arrow press lands on the first day instead of skipping it.
      setActive((current) =>
        current === null && key.startsWith("Arrow") ? 0 : keys[key](current ?? 0),
      );
    }
  };

  const activePoint = active !== null ? points[active] : null;
  const activeX = active !== null ? x(active) : 0;
  const tooltipOnLeft = activeX + TOOLTIP_OFFSET + TOOLTIP_WIDTH > width;
  const liveText =
    activePoint && active !== null
      ? `${activePoint.fullLabel}: ${series
          .map((s) => `${s.label} ${s.values[active] !== null ? formatValue(s.values[active] as number) : "—"}`)
          .join(", ")}`
      : "";

  return (
    <div>
      {series.length > 1 && (
        <ul className="mb-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-secondary" aria-hidden="true">
          {series.map((s) => (
            <li key={s.id} className="flex items-center gap-2">
              <span className="h-0.5 w-4 rounded-full" style={{ background: s.color }} />
              {s.label}
            </li>
          ))}
        </ul>
      )}

      <div
        ref={containerRef}
        role="group"
        aria-label={ariaLabel}
        aria-describedby={hintId}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onFocus={() => setActive((current) => current ?? 0)}
        onBlur={() => setActive(null)}
        className="focus-ring relative rounded-xl"
        style={{ height }}
      >
        {width > 0 && count > 0 && (
          <svg
            width={width}
            height={height}
            className="block touch-pan-y select-none"
            aria-hidden="true"
            onPointerMove={setFromPointer}
            onPointerDown={setFromPointer}
            onPointerLeave={() => setActive(null)}
          >
            {/* Gridlines + y ticks — hairline, recessive */}
            {ticks.map((tick) => {
              const ty = Math.round(y(tick)) + 0.5;
              return (
                <g key={tick}>
                  <line x1={MARGIN.left} x2={width - MARGIN.right} y1={ty} y2={ty} stroke="var(--chart-grid)" />
                  <text
                    x={MARGIN.left - 10}
                    y={ty}
                    textAnchor="end"
                    dominantBaseline="middle"
                    fontSize={11}
                    fill={muted}
                    className="tabular-nums"
                  >
                    {formatTick(tick)}
                  </text>
                </g>
              );
            })}

            {/* X labels — thinned so they never collide */}
            {points.map((point, i) =>
              i % stride === 0 ? (
                <text
                  key={i}
                  x={x(i)}
                  y={height - 8}
                  textAnchor="middle"
                  fontSize={11}
                  fill={i === active ? secondary : muted}
                  fontWeight={i === active ? 600 : 400}
                >
                  {point.label}
                </text>
              ) : null,
            )}

            {type === "bar" && first && (
              <>
                <line
                  x1={MARGIN.left}
                  x2={width - MARGIN.right}
                  y1={Math.round(baseline) + 0.5}
                  y2={Math.round(baseline) + 0.5}
                  stroke="var(--chart-axis)"
                />
                {first.values.map((value, i) =>
                  value === null ? null : (
                    <path
                      key={i}
                      d={columnPath(x(i) - barWidth / 2, y(value), barWidth, baseline - y(value))}
                      fill={first.color}
                      opacity={active === null || active === i ? 1 : 0.4}
                      className="transition-opacity duration-150"
                    />
                  ),
                )}
              </>
            )}

            {type === "line" && (
              <>
                {band && (
                  <path d={bandPath(toPoints(band.upper), toPoints(band.lower))} fill="var(--chart-band)" />
                )}
                {active !== null && (
                  <line
                    x1={activeX}
                    x2={activeX}
                    y1={MARGIN.top}
                    y2={MARGIN.top + plotHeight}
                    stroke="var(--chart-axis)"
                  />
                )}
                {series.map((s) => (
                  <path
                    key={s.id}
                    d={linePath(toPoints(s.values))}
                    fill="none"
                    stroke={s.color}
                    strokeWidth={2}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                ))}
                {active !== null &&
                  series.map((s) =>
                    s.values[active] === null ? null : (
                      <circle
                        key={s.id}
                        cx={activeX}
                        cy={y(s.values[active] as number)}
                        r={5}
                        fill={s.color}
                        stroke="var(--chart-surface)"
                        strokeWidth={2}
                      />
                    ),
                  )}
              </>
            )}

            {/* Direct labels on the extremes (hidden while the tooltip shows the same values) */}
            {active === null &&
              labels.map(({ index, value, seriesIndex, position }) => {
                const cx = x(index);
                const cy = y(value);
                const labelX = Math.min(width - MARGIN.right - 14, Math.max(MARGIN.left + 14, cx));
                let offset = type === "bar" ? -8 : position === "above" ? -11 : 19;
                // A low near the baseline would collide with the x labels — put it above the point.
                if (type === "line" && position === "below" && cy + offset > MARGIN.top + plotHeight - 4) {
                  offset = -11;
                }
                return (
                  <g key={`${seriesIndex}-${index}-${position}`}>
                    {type === "line" && (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={4}
                        fill={series[seriesIndex].color}
                        stroke="var(--chart-surface)"
                        strokeWidth={2}
                      />
                    )}
                    <text
                      x={labelX}
                      y={cy + offset}
                      textAnchor="middle"
                      fontSize={12}
                      fontWeight={600}
                      fill={secondary}
                    >
                      {formatValue(value)}
                    </text>
                  </g>
                );
              })}
          </svg>
        )}

        {activePoint && active !== null && (
          <div
            className="pointer-events-none absolute z-10 rounded-xl border border-line bg-surface px-3 py-2.5 text-sm shadow-overlay"
            style={{
              top: MARGIN.top,
              left: tooltipOnLeft ? activeX - TOOLTIP_OFFSET : activeX + TOOLTIP_OFFSET,
              transform: tooltipOnLeft ? "translateX(-100%)" : undefined,
              width: TOOLTIP_WIDTH,
            }}
          >
            <p className="font-semibold text-ink">{activePoint.fullLabel}</p>
            {activePoint.detail && <p className="mt-0.5 truncate text-xs text-ink-muted">{activePoint.detail}</p>}
            <ul className="mt-2 space-y-1">
              {series.map((s) => (
                <li key={s.id} className="flex items-center gap-2">
                  <span className="h-0.5 w-3 shrink-0 rounded-full" style={{ background: s.color }} />
                  <span className="font-semibold tabular-nums text-ink">
                    {s.values[active] !== null ? formatValue(s.values[active] as number) : "—"}
                  </span>
                  <span className="truncate text-ink-muted">{s.label}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <p id={hintId} className="mt-2 text-xs text-ink-muted">
        {hint}
      </p>
      <p className="sr-only" aria-live="polite">
        {liveText}
      </p>
    </div>
  );
}

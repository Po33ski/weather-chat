export type Point = { x: number; y: number };

/** Round a raw step to 1, 2, 2.5 or 5 × 10ⁿ so axis ticks land on clean numbers. */
export function niceStep(rawStep: number): number {
  if (!Number.isFinite(rawStep) || rawStep <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const residual = rawStep / magnitude;
  const nice = residual <= 1 ? 1 : residual <= 2 ? 2 : residual <= 2.5 ? 2.5 : residual <= 5 ? 5 : 10;
  return nice * magnitude;
}

/** Evenly spaced, rounded ticks covering [min, max]; never fewer than two. */
export function niceTicks(min: number, max: number, maxTicks = 5): number[] {
  let lo = min;
  let hi = max;
  if (lo === hi) {
    // ±1 % keeps a flat pressure line (1013 hPa) on a tight axis; ±1 near zero.
    const pad = Math.max(1, Math.abs(lo) * 0.01);
    lo -= pad;
    hi += pad;
  }
  const step = niceStep((hi - lo) / Math.max(1, maxTicks - 1));
  const start = Math.floor(lo / step) * step;
  const end = Math.ceil(hi / step) * step;
  // Snap away float noise (0.30000000000000004) using the step's precision.
  const decimals = Math.max(0, -Math.floor(Math.log10(step)) + 1);
  const ticks: number[] = [];
  for (let v = start; v <= end + step / 2; v += step) {
    ticks.push(Number(v.toFixed(decimals)));
  }
  return ticks;
}

export function linearScale(
  [d0, d1]: [number, number],
  [r0, r1]: [number, number],
): (value: number) => number {
  if (d0 === d1) return () => (r0 + r1) / 2;
  return (value) => r0 + ((value - d0) / (d1 - d0)) * (r1 - r0);
}

export function extent(values: (number | null)[]): [number, number] | null {
  const numbers = values.filter((v): v is number => v !== null && Number.isFinite(v));
  return numbers.length ? [Math.min(...numbers), Math.max(...numbers)] : null;
}

/** Index of the first max/min value, or null when there are no numbers. */
export function extremeIndex(values: (number | null)[], kind: "max" | "min"): number | null {
  let best: number | null = null;
  let bestValue = 0;
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    if (value === null) continue;
    if (best === null || (kind === "max" ? value > bestValue : value < bestValue)) {
      best = i;
      bestValue = value;
    }
  }
  return best;
}

/** Show every n-th x label so labels keep at least `minSpacing` px between them. */
export function labelStride(count: number, plotWidth: number, minSpacing = 52): number {
  if (count <= 1 || plotWidth <= 0) return 1;
  const fits = Math.max(1, Math.floor(plotWidth / minSpacing));
  return Math.max(1, Math.ceil(count / fits));
}

/** SVG path through the points; a null point breaks the line instead of bridging the gap. */
export function linePath(points: (Point | null)[]): string {
  let path = "";
  let penDown = false;
  for (const point of points) {
    if (!point) {
      penDown = false;
      continue;
    }
    path += `${penDown ? "L" : "M"}${point.x.toFixed(1)},${point.y.toFixed(1)}`;
    penDown = true;
  }
  return path;
}

/** Closed area between two lines, split into segments wherever either side is missing. */
export function bandPath(upper: (Point | null)[], lower: (Point | null)[]): string {
  const segments: { top: Point[]; bottom: Point[] }[] = [];
  let current: { top: Point[]; bottom: Point[] } | null = null;
  upper.forEach((top, i) => {
    const bottom = lower[i];
    if (top && bottom) {
      current ??= { top: [], bottom: [] };
      current.top.push(top);
      current.bottom.push(bottom);
    } else if (current) {
      segments.push(current);
      current = null;
    }
  });
  if (current) segments.push(current);

  return segments
    .filter((s) => s.top.length > 1)
    .map(({ top, bottom }) => {
      const outline = [...top, ...bottom.reverse()];
      return `M${outline.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join("L")}Z`;
    })
    .join("");
}

/** Column rising from the baseline: rounded data end (top), square at the baseline. */
export function columnPath(x: number, y: number, width: number, height: number, radius = 4): string {
  if (height <= 0 || width <= 0) return "";
  const r = Math.min(radius, width / 2, height);
  const bottom = y + height;
  return [
    `M${x},${bottom}`,
    `V${y + r}`,
    `Q${x},${y} ${x + r},${y}`,
    `H${x + width - r}`,
    `Q${x + width},${y} ${x + width},${y + r}`,
    `V${bottom}`,
    "Z",
  ].join("");
}

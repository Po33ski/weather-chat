import { describe, expect, it } from "vitest";
import {
  bandPath,
  columnPath,
  extent,
  extremeIndex,
  labelStride,
  linearScale,
  linePath,
  niceStep,
  niceTicks,
} from "./chartScale";

describe("niceStep / niceTicks", () => {
  it("rounds steps to 1, 2, 2.5 or 5 × 10ⁿ", () => {
    expect(niceStep(0.7)).toBe(1);
    expect(niceStep(1.4)).toBe(2);
    expect(niceStep(23)).toBe(25);
    expect(niceStep(37)).toBe(50);
    expect(niceStep(0)).toBe(1);
  });

  it("covers the data range with clean ticks", () => {
    expect(niceTicks(0, 100, 5)).toEqual([0, 25, 50, 75, 100]);
    expect(niceTicks(11.3, 24.8, 5)).toEqual([10, 15, 20, 25]);
    expect(niceTicks(-3, 4, 5)).toEqual([-4, -2, 0, 2, 4]);
  });

  it("avoids floating point noise", () => {
    expect(niceTicks(0.1, 0.7, 4)).toEqual([0, 0.2, 0.4, 0.6, 0.8]);
  });

  it("pads a flat series without blowing up the axis", () => {
    const ticks = niceTicks(1013, 1013);
    expect(ticks[0]).toBeLessThan(1013);
    expect(ticks[ticks.length - 1]).toBeGreaterThan(1013);
    expect(ticks[ticks.length - 1] - ticks[0]).toBeLessThanOrEqual(30);
  });
});

describe("linearScale", () => {
  it("maps domain to range (inverted y)", () => {
    const y = linearScale([0, 100], [200, 0]);
    expect(y(0)).toBe(200);
    expect(y(25)).toBe(150);
  });

  it("centers a degenerate domain", () => {
    expect(linearScale([5, 5], [0, 100])(5)).toBe(50);
  });
});

describe("extent / extremeIndex", () => {
  it("ignores nulls", () => {
    expect(extent([3, null, -1, 7])).toEqual([-1, 7]);
    expect(extent([null])).toBeNull();
  });

  it("returns the first index of the extreme", () => {
    expect(extremeIndex([3, 9, 9, 1], "max")).toBe(1);
    expect(extremeIndex([3, null, 1, 1], "min")).toBe(2);
    expect(extremeIndex([null, null], "max")).toBeNull();
  });
});

describe("labelStride", () => {
  it("thins labels that would collide", () => {
    expect(labelStride(7, 600)).toBe(1);
    expect(labelStride(15, 300)).toBe(3);
    expect(labelStride(1, 0)).toBe(1);
  });
});

describe("paths", () => {
  it("breaks the line at missing values", () => {
    expect(linePath([{ x: 0, y: 0 }, { x: 1, y: 1 }, null, { x: 3, y: 3 }])).toBe("M0.0,0.0L1.0,1.0M3.0,3.0");
  });

  it("closes a band only where both edges exist", () => {
    const path = bandPath(
      [{ x: 0, y: 0 }, { x: 1, y: 0 }, null],
      [{ x: 0, y: 5 }, { x: 1, y: 5 }, { x: 2, y: 5 }],
    );
    expect(path).toBe("M0.0,0.0L1.0,0.0L1.0,5.0L0.0,5.0Z");
  });

  it("draws nothing for an empty column", () => {
    expect(columnPath(0, 10, 20, 0)).toBe("");
    expect(columnPath(0, 10, 20, 30)).toMatch(/^M0,40V14Q0,10 4,10H16Q20,10 20,14V40Z$/);
  });
});

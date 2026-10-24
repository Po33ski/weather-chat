import { useLayoutEffect, useRef, useState } from "react";

/**
 * Track an element's content width. Charts render at real pixel size (instead
 * of scaling a viewBox) so text and stroke widths stay crisp at any width.
 */
export function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element || typeof ResizeObserver === "undefined") return;
    // ResizeObserver reports the initial size right after observe().
    const observer = new ResizeObserver(([entry]) => {
      setWidth(Math.floor(entry.contentRect.width));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return [ref, width] as const;
}

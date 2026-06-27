"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type ChartDimensions = {
  height: number;
  width: number;
};

type ResponsiveChartFrameProps = {
  children: (dimensions: ChartDimensions) => ReactNode;
  className: string;
  fallback?: ReactNode;
};

export function ResponsiveChartFrame({
  children,
  className,
  fallback = null,
}: ResponsiveChartFrameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<ChartDimensions | null>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const updateSize = () => {
      const { width, height } = container.getBoundingClientRect();

      if (width > 0 && height > 0) {
        setDimensions({
          width: Math.floor(width),
          height: Math.floor(height),
        });
        return;
      }

      setDimensions(null);
    };

    updateSize();

    const resizeObserver = new ResizeObserver(() => {
      updateSize();
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className={className}>
      {dimensions ? children(dimensions) : fallback}
    </div>
  );
}

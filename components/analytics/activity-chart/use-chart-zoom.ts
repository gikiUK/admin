"use client";

import { useCallback, useRef, useState } from "react";
import type { ChartClickPayload } from "./types";

const DRAG_THRESHOLD = 6;

type ZoomRange = { startIndex: number; endIndex: number } | null;

type ChartState = {
  activeLabel?: string | number;
  activeTooltipIndex?: number | string | null;
  activePayload?: Array<{ dataKey?: string | number }>;
};

function toIndex(value: number | string | null | undefined): number | null {
  if (value == null) return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

function isInsideBrush(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest(".recharts-brush") !== null;
}

type Args = {
  totalLength: number;
  onPointClick?: (payload: ChartClickPayload) => void;
};

export function useChartZoom({ totalLength, onPointClick }: Args) {
  const [zoom, setZoom] = useState<ZoomRange>(null);
  const [dragRange, setDragRange] = useState<{ from: string; to: string } | null>(null);
  const dragStartRef = useRef<{ x: number; index: number; label: string } | null>(null);
  const startedInsideBrushRef = useRef(false);

  const reset = useCallback(() => {
    setZoom(null);
    setDragRange(null);
    dragStartRef.current = null;
    startedInsideBrushRef.current = false;
  }, []);

  const handleBrushChange = useCallback(
    (range: { startIndex?: number; endIndex?: number } | null) => {
      if (!range || range.startIndex === undefined || range.endIndex === undefined) return;
      if (range.startIndex === 0 && range.endIndex === totalLength - 1) {
        setZoom(null);
        return;
      }
      setZoom({ startIndex: range.startIndex, endIndex: range.endIndex });
    },
    [totalLength]
  );

  const onMouseDown = useCallback((state: ChartState | null, event: React.MouseEvent) => {
    startedInsideBrushRef.current = isInsideBrush(event.target);
    if (startedInsideBrushRef.current) return;
    if (!state || state.activeLabel === undefined) return;
    const index = toIndex(state.activeTooltipIndex);
    if (index === null) return;
    dragStartRef.current = { x: event.clientX, index, label: String(state.activeLabel) };
    setDragRange(null);
  }, []);

  const onMouseMove = useCallback((state: ChartState | null, event: React.MouseEvent) => {
    const start = dragStartRef.current;
    if (!start || !state?.activeLabel) return;
    if (Math.abs(event.clientX - start.x) < DRAG_THRESHOLD) return;
    const next = String(state.activeLabel);
    const [from, to] = next < start.label ? [next, start.label] : [start.label, next];
    setDragRange({ from, to });
  }, []);

  const onMouseUp = useCallback(
    (state: ChartState | null, event: React.MouseEvent) => {
      const start = dragStartRef.current;
      const startedOnBrush = startedInsideBrushRef.current;
      dragStartRef.current = null;
      startedInsideBrushRef.current = false;
      if (startedOnBrush || isInsideBrush(event.target)) {
        setDragRange(null);
        return;
      }
      const dx = start ? Math.abs(event.clientX - start.x) : 0;
      const endIdx = toIndex(state?.activeTooltipIndex);

      if (start && dx >= DRAG_THRESHOLD && endIdx !== null) {
        const startIndex = Math.min(start.index, endIdx);
        const endIndex = Math.max(start.index, endIdx);
        if (startIndex !== endIndex) setZoom({ startIndex, endIndex });
        setDragRange(null);
        return;
      }

      setDragRange(null);
      if (onPointClick && state?.activeLabel) {
        const date = String(state.activeLabel);
        const top = state.activePayload?.[0];
        const rawKey = typeof top?.dataKey === "string" ? top.dataKey : null;
        const seriesKey = rawKey && !rawKey.startsWith("prev_") ? rawKey : null;
        onPointClick({ date, seriesKey });
      }
    },
    [onPointClick]
  );

  const onMouseLeave = useCallback(() => {
    dragStartRef.current = null;
    startedInsideBrushRef.current = false;
    setDragRange(null);
  }, []);

  return { zoom, dragRange, reset, handleBrushChange, onMouseDown, onMouseMove, onMouseUp, onMouseLeave };
}

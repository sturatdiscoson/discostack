"use client";

import { useRef, useState } from "react";
import { formatCurrency } from "@/lib/formatters";

type StatisticsChartsProps = {
  monthlyLabels: string[];
  monthlyValues: number[];
  profitTrendValues: number[];
};

type TooltipState = {
  visible: boolean;
  x: number;
  y: number;
  title: string;
  value: number;
};

function buildSparklinePath(values: number[], width: number, height: number, padding = 24) {
  if (values.length === 0) return "";

  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue === minValue ? 1 : maxValue - minValue;
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;

  return values
    .map((value, index) => {
      const x = padding + (index / (values.length - 1 || 1)) * innerWidth;
      const y = padding + ((maxValue - value) / range) * innerHeight;
      return `${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}

export default function StatisticsCharts({ monthlyLabels, monthlyValues, profitTrendValues }: StatisticsChartsProps) {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const [barTooltip, setBarTooltip] = useState<TooltipState | null>(null);
  const [pointTooltip, setPointTooltip] = useState<TooltipState | null>(null);
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  const monthlyChartHeight = 260;
  const monthlyChartWidth = Math.max(monthlyLabels.length * 100, 380);
  const chartPadding = 24;
  const labelAreaHeight = 28;
  const monthlyMax = monthlyValues.length > 0 ? Math.max(...monthlyValues) : 0;
  const monthlyMin = monthlyValues.length > 0 ? Math.min(...monthlyValues) : 0;
  const monthlyRange = monthlyMax - monthlyMin || 1;
  const monthlyPlotHeight = monthlyChartHeight - chartPadding * 2 - labelAreaHeight;
  const monthlyZeroY = chartPadding + ((monthlyMax - 0) / monthlyRange) * monthlyPlotHeight;

  const profitTrendPath = buildSparklinePath(profitTrendValues, 640, 240, 24);
  const profitTrendMax = Math.max(...profitTrendValues, 0);
  const profitTrendMin = Math.min(...profitTrendValues, 0);
  const profitTrendRange = profitTrendMax - profitTrendMin || 1;

  const handleBarHover = (index: number, event: React.PointerEvent<SVGRectElement>) => {
    const rect = chartRef.current?.getBoundingClientRect();
    if (!rect) return;
    setHoveredBarIndex(index);
    setBarTooltip({
      visible: true,
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      title: monthlyLabels[index],
      value: monthlyValues[index],
    });
  };

  const handlePointHover = (index: number, event: React.PointerEvent<SVGRectElement>) => {
    const rect = chartRef.current?.getBoundingClientRect();
    if (!rect) return;
    setHoveredPointIndex(index);
    setPointTooltip({
      visible: true,
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      title: `Session ${index + 1}`,
      value: profitTrendValues[index],
    });
  };

  const clearTooltip = () => {
    setBarTooltip(null);
    setPointTooltip(null);
    setHoveredBarIndex(null);
    setHoveredPointIndex(null);
  };

  return (
    <div ref={chartRef} className="space-y-8 relative" onPointerLeave={clearTooltip}>
      {(barTooltip || pointTooltip) && (
        <div
          className="pointer-events-none absolute z-20 rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white shadow-2xl"
          style={{
            left: Math.min((barTooltip?.x ?? pointTooltip?.x ?? 0) + 12, (chartRef.current?.clientWidth ?? 0) - 180),
            top: Math.max((barTooltip?.y ?? pointTooltip?.y ?? 0) - 52, 8),
          }}
        >
          <p className="font-semibold text-zinc-200">{barTooltip?.title ?? pointTooltip?.title}</p>
          <p className={`mt-1 ${((barTooltip?.value ?? pointTooltip?.value ?? 0) ?? 0) < 0 ? "text-rose-400" : "text-emerald-400"}`}>
            {formatCurrency(barTooltip?.value ?? pointTooltip?.value ?? 0)}
          </p>
        </div>
      )}

      <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-zinc-400">
          <div className="flex flex-wrap items-center gap-3">
            <span>Monthly profit</span>
            <span className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-950 px-3 py-1">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              Positive
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-950 px-3 py-1">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
              Negative
            </span>
          </div>
          <span>
            High {formatCurrency(monthlyMax)} • Low {formatCurrency(monthlyMin)}
          </span>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-zinc-800 bg-zinc-950 p-4">
          <svg width={monthlyChartWidth} height={monthlyChartHeight} className="w-full">
            <defs>
              <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#22c55e" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#22c55e" stopOpacity="0.3" />
              </linearGradient>
              <linearGradient id="barGradientLoss" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fb7185" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#fb7185" stopOpacity="0.3" />
              </linearGradient>
            </defs>
            <rect x={0} y={0} width={monthlyChartWidth} height={monthlyChartHeight} rx={24} fill="#090b11" />
            <g opacity={0.35}>
              {[0.25, 0.5, 0.75].map((fraction) => (
                <line
                  key={fraction}
                  x1={chartPadding}
                  y1={chartPadding + fraction * monthlyPlotHeight}
                  x2={monthlyChartWidth - chartPadding}
                  y2={chartPadding + fraction * monthlyPlotHeight}
                  stroke="#374151"
                  strokeDasharray="3 4"
                />
              ))}
            </g>
            <line
              x1={chartPadding}
              y1={monthlyZeroY}
              x2={monthlyChartWidth - chartPadding}
              y2={monthlyZeroY}
              stroke="#4b5563"
              strokeDasharray="4 4"
            />

            {monthlyValues.map((value, index) => {
              const barWidth = 32;
              const gap = 28;
              const x = index * (barWidth + gap) + gap;
              const positive = value >= 0;
              const barHeight = Math.max((Math.abs(value) / monthlyRange) * monthlyPlotHeight, 8);
              const y = positive ? monthlyZeroY - barHeight : monthlyZeroY;
              const isHovered = hoveredBarIndex === index;

              return (
                <g key={monthlyLabels[index]}>
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    rx={12}
                    fill={positive ? "url(#barGradient)" : "url(#barGradientLoss)"}
                    opacity={isHovered ? 1 : 0.95}
                    stroke={isHovered ? "#f8fafc" : "transparent"}
                    strokeWidth={isHovered ? 2 : 0}
                  />
                  <rect
                    x={x - 10}
                    y={chartPadding}
                    width={barWidth + 20}
                    height={monthlyPlotHeight}
                    fill="transparent"
                    onPointerMove={(event) => handleBarHover(index, event)}
                  />
                </g>
              );
            })}

            {monthlyLabels.map((label, index) => {
              const barWidth = 32;
              const gap = 28;
              const x = index * (barWidth + gap) + gap;
              return (
                <text
                  key={`label-${label}`}
                  x={x + barWidth / 2}
                  y={monthlyChartHeight - 8}
                  textAnchor="middle"
                  fontSize="11"
                  fill="#cbd5e1"
                >
                  {label}
                </text>
              );
            })}
          </svg>
        </div>
      </div>

      <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="mb-4 flex items-center justify-between gap-4 text-sm text-zinc-400">
          <span>Session profit trend</span>
          <span>{profitTrendValues.length} points</span>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-zinc-800 bg-zinc-950 p-4">
          <svg width={640} height={240} className="w-full">
            <defs>
              <linearGradient id="profitGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#22c55e" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
              </linearGradient>
            </defs>
            <rect x={0} y={0} width={640} height={240} rx={24} fill="#090b11" />
            <g opacity={0.35}>
              {[0.25, 0.5, 0.75].map((fraction) => (
                <line
                  key={fraction}
                  x1={chartPadding}
                  y1={chartPadding + fraction * (240 - chartPadding * 2)}
                  x2={640 - chartPadding}
                  y2={chartPadding + fraction * (240 - chartPadding * 2)}
                  stroke="#374151"
                  strokeDasharray="3 4"
                />
              ))}
            </g>
            <path d={profitTrendPath} fill="none" stroke="#22c55e" strokeWidth={3} strokeLinecap="round" />
            <path d={`${profitTrendPath} L616 216 L24 216 Z`} fill="url(#profitGradient)" opacity={0.6} />

            {profitTrendValues.map((value, index) => {
              const x = chartPadding + (index / (Math.max(profitTrendValues.length - 1, 1))) * (640 - chartPadding * 2);
              const y = chartPadding + ((profitTrendMax - value) / profitTrendRange) * (240 - chartPadding * 2);
              const isHovered = hoveredPointIndex === index;

              return (
                <g key={index}>
                  <circle cx={x} cy={y} r={isHovered ? 7 : 5} fill={isHovered ? "#38bdf8" : "#0ea5e9"} opacity={isHovered ? 1 : 0.9} />
                  <rect
                    x={x - 20}
                    y={chartPadding}
                    width={40}
                    height={240 - chartPadding * 2}
                    fill="transparent"
                    onPointerMove={(event) => handlePointHover(index, event)}
                  />
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}

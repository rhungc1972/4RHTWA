import React, { useState } from 'react';

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
  desc?: string;
}

interface ContemporaryDonutChartProps {
  title: string;
  subtitle?: string;
  data: DonutSegment[];
  centerLabel?: string;
  centerValue?: string | number;
  size?: number;
  strokeWidth?: number;
  unit?: string;
}

export const ContemporaryDonutChart: React.FC<ContemporaryDonutChartProps> = ({
  title,
  subtitle,
  data,
  centerLabel = 'Total',
  centerValue,
  size = 220,
  strokeWidth = 28,
  unit = '',
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const total = data.reduce((acc, curr) => acc + curr.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // If empty or all zeros
  const isEmpty = total === 0;
  const safeTotal = isEmpty ? 1 : total;

  let accumulatedPercent = 0;

  return (
    <div className="bg-[#0A0A0A] border border-neutral-800 rounded-2xl p-5 flex flex-col justify-between shadow-xl transition-all hover:border-neutral-700">
      {/* Header */}
      <div className="mb-4">
        <h4 className="text-sm font-heading font-bold text-white uppercase tracking-wider flex items-center justify-between">
          <span>{title}</span>
          <span className="text-xs font-mono-code text-[#FF6105] font-semibold">
            {total} {unit}
          </span>
        </h4>
        {subtitle && <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">{subtitle}</p>}
      </div>

      {/* Main Chart Graphic & Hover details */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 my-2">
        <div className="relative shrink-0" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="transform -rotate-90">
            {/* Background ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#1C1C1F"
              strokeWidth={strokeWidth}
              fill="transparent"
            />

            {/* If no data yet, show subtle empty placeholder circle */}
            {isEmpty && (
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="#27272A"
                strokeWidth={strokeWidth}
                strokeDasharray="6 6"
                fill="transparent"
              />
            )}

            {/* Segments */}
            {!isEmpty &&
              data.map((item, idx) => {
                const percent = (item.value / safeTotal) * 100;
                const strokeDashoffset = circumference - (percent / 100) * circumference;
                const rotation = (accumulatedPercent / 100) * 360;
                accumulatedPercent += percent;

                const isHovered = hoveredIdx === idx;

                return (
                  <circle
                    key={item.label}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={item.color}
                    strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                    transform={`rotate(${rotation} ${size / 2} ${size / 2})`}
                    className="transition-all duration-300 cursor-pointer"
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    style={{
                      filter: isHovered
                        ? `drop-shadow(0 0 8px ${item.color}80)`
                        : 'drop-shadow(0 0 1px rgba(0,0,0,0.5))',
                    }}
                  />
                );
              })}
          </svg>

          {/* Center Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4">
            <span className="text-[11px] font-mono-code uppercase tracking-wider text-neutral-400">
              {hoveredIdx !== null ? data[hoveredIdx].label : centerLabel}
            </span>
            <span className="text-2xl font-heading font-extrabold text-white leading-tight">
              {hoveredIdx !== null
                ? `${Math.round((data[hoveredIdx].value / safeTotal) * 100)}%`
                : centerValue !== undefined
                ? centerValue
                : `${total}`}
            </span>
            {hoveredIdx !== null && (
              <span className="text-[10px] font-mono-code text-[#FF6105]">
                {data[hoveredIdx].value} {unit}
              </span>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 w-full space-y-2 text-xs">
          {data.map((item, idx) => {
            const pct = isEmpty ? 0 : Math.round((item.value / safeTotal) * 100);
            const isHovered = hoveredIdx === idx;

            return (
              <div
                key={item.label}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className={`p-2 rounded-xl transition-all cursor-pointer border ${
                  isHovered
                    ? 'bg-neutral-900 border-neutral-700 shadow-md'
                    : 'bg-transparent border-transparent hover:bg-neutral-900/50'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium text-neutral-300 truncate" title={item.label}>
                      {item.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 font-mono-code font-bold">
                    <span className="text-white">{item.value}</span>
                    <span className="text-neutral-400 text-[11px]">({pct}%)</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

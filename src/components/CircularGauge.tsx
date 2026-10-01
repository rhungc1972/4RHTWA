import React from 'react';

interface CircularGaugeProps {
  percent: number; // 0 - 100
  valueLabel: string | number;
  subLabel?: string;
  title: string;
  category?: string;
  color?: string;
  bgColor?: string;
  size?: number;
  strokeWidth?: number;
  icon?: React.ReactNode;
}

export const CircularGauge: React.FC<CircularGaugeProps> = ({
  percent,
  valueLabel,
  subLabel,
  title,
  category,
  color = '#FF6105',
  bgColor = '#E5E7EB',
  size = 110,
  strokeWidth = 9,
  icon,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedPercent = Math.max(0, Math.min(100, isNaN(percent) ? 0 : percent));
  const offset = circumference - (clampedPercent / 100) * circumference;

  return (
    <div className="bg-white p-5 rounded-2xl border border-neutral-300 shadow-sm flex flex-col items-center text-center justify-between transition-all hover:shadow-md">
      <div className="w-full flex items-center justify-between text-xs mb-2">
        <span className="font-heading font-bold uppercase tracking-wider text-neutral-600 truncate">
          {title}
        </span>
        {icon && <div className="text-[#FF6105] shrink-0">{icon}</div>}
      </div>

      {/* Circle SVG */}
      <div className="relative my-2 flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={bgColor}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated active progress arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Text inside Circle */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl sm:text-2xl font-black font-mono-code text-neutral-950 leading-tight">
            {valueLabel}
          </span>
          {subLabel && (
            <span className="text-[10px] text-neutral-500 font-mono-code font-medium">
              {subLabel}
            </span>
          )}
        </div>
      </div>

      {/* Category / Subtext */}
      {category && (
        <span className="text-[11px] font-heading font-semibold text-neutral-500 mt-1 line-clamp-1">
          {category}
        </span>
      )}
    </div>
  );
};

interface NpsDonutProps {
  promoters: number;
  passives: number;
  detractors: number;
  npsIndex: number;
  avgNps: number;
}

export const NpsDonutChart: React.FC<NpsDonutProps> = ({
  promoters,
  passives,
  detractors,
  npsIndex,
  avgNps,
}) => {
  const total = promoters + passives + detractors || 1;
  const size = 110;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const pctPromoters = (promoters / total) * 100;
  const pctPassives = (passives / total) * 100;
  const pctDetractors = (detractors / total) * 100;

  const offsetPromoters = circumference - (pctPromoters / 100) * circumference;
  const offsetPassives = circumference - ((pctPromoters + pctPassives) / 100) * circumference;
  const offsetDetractors = 0; // entire circle

  return (
    <div className="bg-white p-5 rounded-2xl border border-neutral-300 shadow-sm flex flex-col items-center text-center justify-between transition-all hover:shadow-md">
      <div className="w-full flex items-center justify-between text-xs mb-2">
        <span className="font-heading font-bold uppercase tracking-wider text-neutral-600">
          Recomendación (NPS)
        </span>
        <span className="text-[10px] font-mono-code text-[#FF6105] font-bold">
          {avgNps}/10 pts
        </span>
      </div>

      {/* Multi-segment Donut Chart */}
      <div className="relative my-2 flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Base track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Detractors Arc (Red) */}
          {detractors > 0 && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#EF4444"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={0}
              fill="transparent"
            />
          )}

          {/* Passives Arc (Amber) */}
          {passives > 0 && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#F59E0B"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={offsetPassives}
              fill="transparent"
            />
          )}

          {/* Promoters Arc (Orange / Emerald) */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#FF6105"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offsetPromoters}
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Net NPS Score */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl sm:text-2xl font-black font-mono-code text-[#FF6105] leading-tight">
            +{npsIndex}
          </span>
          <span className="text-[9px] text-neutral-500 font-mono-code uppercase font-semibold">
            Índice NPS
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="w-full flex items-center justify-center gap-2 text-[10px] font-mono-code mt-1 text-neutral-600">
        <span className="text-[#FF6105] font-bold">{promoters} Prom</span>
        <span>•</span>
        <span className="text-amber-600 font-semibold">{passives} Pas</span>
        <span>•</span>
        <span className="text-red-500 font-semibold">{detractors} Det</span>
      </div>
    </div>
  );
};

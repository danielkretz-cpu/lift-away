'use client';

import { BodyWeightEntry } from '@/types';

interface BodyWeightChartProps {
  bodyWeightHistory: BodyWeightEntry[];
  unit: 'lbs' | 'kg';
}

export default function BodyWeightChart({
  bodyWeightHistory,
  unit,
}: BodyWeightChartProps) {
  if (!bodyWeightHistory || bodyWeightHistory.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
          Body Weight
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No body weight entries yet. Tap &quot;Log Weight&quot; to start tracking!
        </p>
      </div>
    );
  }

  // Sort entries by date
  const dataPoints = [...bodyWeightHistory]
    .map((entry) => ({
      date: new Date(entry.date),
      weight: entry.weight,
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const weights = dataPoints.map((d) => d.weight);
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);
  const range = maxWeight - minWeight || 10;

  // Calculate trend
  const firstWeight = weights[0];
  const lastWeight = weights[weights.length - 1];
  const weightChange = lastWeight - firstWeight;
  const changePercentage = ((weightChange / firstWeight) * 100).toFixed(1);

  // SVG dimensions
  const width = 300;
  const height = 150;
  const padding = { top: 10, right: 10, bottom: 30, left: 40 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Scale functions
  const xScale = (index: number) =>
    padding.left + (index / Math.max(dataPoints.length - 1, 1)) * chartWidth;
  const yScale = (weight: number) =>
    padding.top + chartHeight - ((weight - minWeight) / range) * chartHeight;

  // Generate path
  const pathD = dataPoints
    .map((point, index) => {
      const x = xScale(index);
      const y = yScale(point.weight);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  // Generate area path for gradient fill
  const areaD = `${pathD} L ${xScale(dataPoints.length - 1)} ${
    padding.top + chartHeight
  } L ${padding.left} ${padding.top + chartHeight} Z`;

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-gray-900 dark:text-white">Body Weight</h3>
        <div className="text-right">
          <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
            {lastWeight} {unit}
          </span>
          {dataPoints.length > 1 && (
            <span
              className={`ml-2 text-sm ${
                weightChange > 0
                  ? 'text-red-500 dark:text-red-400'
                  : weightChange < 0
                  ? 'text-green-500 dark:text-green-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {weightChange > 0 ? '+' : ''}
              {weightChange.toFixed(1)} ({changePercentage}%)
            </span>
          )}
        </div>
      </div>

      <svg width="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        {/* Gradient definition */}
        <defs>
          <linearGradient id="bodyWeightGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#9333ea" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#9333ea" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 0.5, 1].map((ratio) => {
          const y = padding.top + chartHeight * (1 - ratio);
          const weight = Math.round(minWeight + range * ratio);
          return (
            <g key={ratio}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="currentColor"
                className="text-gray-200 dark:text-gray-700"
                strokeDasharray="2,2"
              />
              <text
                x={padding.left - 5}
                y={y + 4}
                textAnchor="end"
                className="text-[10px] fill-gray-500 dark:fill-gray-400"
              >
                {weight}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <path d={areaD} fill="url(#bodyWeightGradient)" />

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke="#9333ea"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {dataPoints.map((point, index) => (
          <circle
            key={index}
            cx={xScale(index)}
            cy={yScale(point.weight)}
            r="4"
            fill="#9333ea"
            stroke="white"
            strokeWidth="2"
          />
        ))}

        {/* X-axis labels (first and last) */}
        {dataPoints.length > 0 && (
          <>
            <text
              x={padding.left}
              y={height - 5}
              textAnchor="start"
              className="text-[10px] fill-gray-500 dark:fill-gray-400"
            >
              {formatDate(dataPoints[0].date)}
            </text>
            {dataPoints.length > 1 && (
              <text
                x={width - padding.right}
                y={height - 5}
                textAnchor="end"
                className="text-[10px] fill-gray-500 dark:fill-gray-400"
              >
                {formatDate(dataPoints[dataPoints.length - 1].date)}
              </text>
            )}
          </>
        )}
      </svg>

      {/* Stats row */}
      <div className="flex justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Start</p>
          <p className="font-semibold text-gray-900 dark:text-white">
            {firstWeight} {unit}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">High</p>
          <p className="font-semibold text-gray-900 dark:text-white">
            {maxWeight} {unit}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Low</p>
          <p className="font-semibold text-gray-900 dark:text-white">
            {minWeight} {unit}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Entries</p>
          <p className="font-semibold text-gray-900 dark:text-white">
            {dataPoints.length}
          </p>
        </div>
      </div>
    </div>
  );
}

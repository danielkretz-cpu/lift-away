'use client';

import { WorkoutLog } from '@/types';
import { EXERCISES } from '@/lib/constants';

interface ProgressChartProps {
  workoutHistory: WorkoutLog[];
  exerciseName: string;
  unit: 'lbs' | 'kg';
}

export default function ProgressChart({
  workoutHistory,
  exerciseName,
  unit,
}: ProgressChartProps) {
  const config = EXERCISES[exerciseName];
  if (!config || config.isBodyweight) return null;

  // Get data points for this exercise
  const dataPoints = workoutHistory
    .filter((workout) => {
      const exercise = workout.exercises[exerciseName as keyof typeof workout.exercises];
      return exercise !== undefined;
    })
    .map((workout) => ({
      date: new Date(workout.date),
      weight: workout.exercises[exerciseName as keyof typeof workout.exercises]!.weight,
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  if (dataPoints.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
          {config.displayName}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">No data yet</p>
      </div>
    );
  }

  const weights = dataPoints.map((d) => d.weight);
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);
  const range = maxWeight - minWeight || 10;

  // SVG dimensions
  const width = 300;
  const height = 120;
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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          {config.displayName}
        </h3>
        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
          {weights[weights.length - 1]} {unit}
        </span>
      </div>

      <svg width="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
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
                y={y}
                textAnchor="end"
                dominantBaseline="middle"
                className="text-[10px] fill-gray-500 dark:fill-gray-400"
              >
                {weight}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <defs>
          <linearGradient id={`gradient-${exerciseName}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill={`url(#gradient-${exerciseName})`} />

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke="#3B82F6"
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
            r="3"
            fill="#3B82F6"
          />
        ))}

        {/* X-axis labels */}
        {dataPoints.length <= 7 ? (
          dataPoints.map((point, index) => (
            <text
              key={index}
              x={xScale(index)}
              y={height - 5}
              textAnchor="middle"
              className="text-[8px] fill-gray-500 dark:fill-gray-400"
            >
              {point.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </text>
          ))
        ) : (
          <>
            <text
              x={xScale(0)}
              y={height - 5}
              textAnchor="start"
              className="text-[8px] fill-gray-500 dark:fill-gray-400"
            >
              {dataPoints[0].date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </text>
            <text
              x={xScale(dataPoints.length - 1)}
              y={height - 5}
              textAnchor="end"
              className="text-[8px] fill-gray-500 dark:fill-gray-400"
            >
              {dataPoints[dataPoints.length - 1].date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </text>
          </>
        )}
      </svg>

      <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
        <span>
          Started: {weights[0]} {unit}
        </span>
        <span className={weights[weights.length - 1] > weights[0] ? 'text-green-600 dark:text-green-400' : ''}>
          {weights[weights.length - 1] > weights[0]
            ? `+${weights[weights.length - 1] - weights[0]} ${unit}`
            : 'No change'}
        </span>
      </div>
    </div>
  );
}

'use client';

import { WorkoutLog } from '@/types';

interface PullupsChartProps {
  workoutHistory: WorkoutLog[];
}

export default function PullupsChart({ workoutHistory }: PullupsChartProps) {
  // Get data points for pullups
  const dataPoints = workoutHistory
    .filter((workout) => workout.exercises.pullups !== undefined)
    .map((workout) => ({
      date: new Date(workout.date),
      totalReps: workout.exercises.pullups.sets.reduce((sum, r) => sum + r, 0),
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  if (dataPoints.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Pull-ups</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">No data yet</p>
      </div>
    );
  }

  const reps = dataPoints.map((d) => d.totalReps);
  const minReps = Math.min(...reps);
  const maxReps = Math.max(...reps);
  const range = maxReps - minReps || 5;

  // SVG dimensions
  const width = 300;
  const height = 120;
  const padding = { top: 10, right: 10, bottom: 30, left: 40 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Scale functions
  const xScale = (index: number) =>
    padding.left + (index / Math.max(dataPoints.length - 1, 1)) * chartWidth;
  const yScale = (value: number) =>
    padding.top + chartHeight - ((value - minReps) / range) * chartHeight;

  // Generate path
  const pathD = dataPoints
    .map((point, index) => {
      const x = xScale(index);
      const y = yScale(point.totalReps);
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
        <h3 className="font-semibold text-gray-900 dark:text-white">Pull-ups</h3>
        <span className="text-lg font-bold text-cyan-600 dark:text-cyan-400">
          {reps[reps.length - 1]} reps
        </span>
      </div>

      <svg width="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        {/* Grid lines */}
        {[0, 0.5, 1].map((ratio) => {
          const y = padding.top + chartHeight * (1 - ratio);
          const repValue = Math.round(minReps + range * ratio);
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
                {repValue}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <defs>
          <linearGradient id="gradient-pullups" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#06B6D4" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#gradient-pullups)" />

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke="#06B6D4"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {dataPoints.map((point, index) => (
          <circle
            key={index}
            cx={xScale(index)}
            cy={yScale(point.totalReps)}
            r="3"
            fill="#06B6D4"
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
        <span>Started: {reps[0]} reps</span>
        <span
          className={
            reps[reps.length - 1] > reps[0] ? 'text-green-600 dark:text-green-400' : ''
          }
        >
          {reps[reps.length - 1] > reps[0]
            ? `+${reps[reps.length - 1] - reps[0]} reps`
            : 'No change'}
        </span>
      </div>
    </div>
  );
}

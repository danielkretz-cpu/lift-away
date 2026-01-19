'use client';

interface DataPoint {
  date: string;
  value: number;
}

interface ExerciseChartProps {
  title: string;
  data: DataPoint[];
  unit?: string;
  color?: string;
}

export default function ExerciseChart({
  title,
  data,
  unit = 'lbs',
  color = '#3b82f6',
}: ExerciseChartProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{title}</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">No data yet</p>
      </div>
    );
  }

  const values = data.map((d) => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue - minValue || 1;
  const padding = range * 0.1;

  const chartMinValue = minValue - padding;
  const chartMaxValue = maxValue + padding;
  const chartRange = chartMaxValue - chartMinValue;

  const chartWidth = 280;
  const chartHeight = 120;
  const pointSpacing = data.length > 1 ? chartWidth / (data.length - 1) : chartWidth / 2;

  const points = data.map((d, i) => {
    const x = data.length > 1 ? i * pointSpacing : chartWidth / 2;
    const y = chartHeight - ((d.value - chartMinValue) / chartRange) * chartHeight;
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  const latestValue = data[data.length - 1]?.value ?? 0;
  const startValue = data[0]?.value ?? 0;
  const change = latestValue - startValue;
  const changePercent = startValue > 0 ? ((change / startValue) * 100).toFixed(1) : 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
        <div className="text-right">
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {latestValue} {unit}
          </p>
          {data.length > 1 && (
            <p
              className={`text-sm ${
                change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}
            >
              {change >= 0 ? '+' : ''}{change} ({changePercent}%)
            </p>
          )}
        </div>
      </div>

      <svg
        viewBox={`-10 -10 ${chartWidth + 20} ${chartHeight + 20}`}
        className="w-full h-32"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = chartHeight * (1 - ratio);
          return (
            <line
              key={ratio}
              x1={0}
              y1={y}
              x2={chartWidth}
              y2={y}
              stroke="currentColor"
              className="text-gray-200 dark:text-gray-700"
              strokeWidth={1}
            />
          );
        })}

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Area under line */}
        <path
          d={`${linePath} L ${points[points.length - 1]?.x ?? 0} ${chartHeight} L 0 ${chartHeight} Z`}
          fill={color}
          fillOpacity={0.1}
        />

        {/* Points */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={4} fill={color} />
        ))}
      </svg>

      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
        <span>{formatChartDate(data[0]?.date)}</span>
        {data.length > 1 && <span>{formatChartDate(data[data.length - 1]?.date)}</span>}
      </div>
    </div>
  );
}

function formatChartDate(dateString: string | undefined): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

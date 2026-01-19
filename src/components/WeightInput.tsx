'use client';

interface WeightInputProps {
  weight: number;
  unit: 'lbs' | 'kg';
  onChange: (weight: number) => void;
  disabled?: boolean;
}

export default function WeightInput({
  weight,
  unit,
  onChange,
  disabled = false,
}: WeightInputProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onChange(Math.max(0, weight - 5))}
        disabled={disabled}
        className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold text-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
      >
        -
      </button>
      <div className="text-center">
        <span className="text-2xl font-bold text-gray-900 dark:text-white">
          {weight}
        </span>
        <span className="text-gray-500 dark:text-gray-400 ml-1 text-sm">
          {unit}
        </span>
      </div>
      <button
        onClick={() => onChange(weight + 5)}
        disabled={disabled}
        className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold text-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
      >
        +
      </button>
    </div>
  );
}

'use client';

interface SetButtonProps {
  setNumber: number;
  reps: number | null;
  targetReps: number;
  isBodyweight?: boolean;
  onComplete: (reps: number) => void;
  onEdit: () => void;
}

export default function SetButton({
  setNumber,
  reps,
  targetReps,
  isBodyweight = false,
  onComplete,
  onEdit,
}: SetButtonProps) {
  const isCompleted = reps !== null;
  const isSuccess = isCompleted && (isBodyweight || reps >= targetReps);

  if (isCompleted) {
    return (
      <button
        onClick={onEdit}
        className={`w-14 h-14 rounded-lg font-bold text-lg transition-all ${
          isSuccess
            ? 'bg-green-500 text-white'
            : 'bg-yellow-500 text-white'
        }`}
      >
        {reps}
      </button>
    );
  }

  return (
    <button
      onClick={() => onComplete(isBodyweight ? 0 : targetReps)}
      className="w-14 h-14 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-bold text-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
    >
      {isBodyweight ? setNumber : targetReps}
    </button>
  );
}

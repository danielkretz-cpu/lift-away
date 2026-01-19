'use client';

import { useState } from 'react';
import SetButton from './SetButton';
import WeightInput from './WeightInput';
import { ExerciseConfig } from '@/types';

interface ExerciseCardProps {
  config: ExerciseConfig;
  weight: number;
  unit: 'lbs' | 'kg';
  sets: (number | null)[];
  onWeightChange: (weight: number) => void;
  onSetComplete: (setIndex: number, reps: number) => void;
}

export default function ExerciseCard({
  config,
  weight,
  unit,
  sets,
  onWeightChange,
  onSetComplete,
}: ExerciseCardProps) {
  const [editingSet, setEditingSet] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const handleSetClick = (setIndex: number, reps: number) => {
    if (config.isBodyweight) {
      // For pullups, show input dialog
      setEditingSet(setIndex);
      setEditValue('');
    } else {
      onSetComplete(setIndex, reps);
    }
  };

  const handleEditSubmit = (setIndex: number) => {
    const reps = parseInt(editValue) || 0;
    onSetComplete(setIndex, reps);
    setEditingSet(null);
    setEditValue('');
  };

  const completedSets = sets.filter(s => s !== null).length;
  const totalReps = sets.reduce((sum: number, s) => sum + (s || 0), 0);
  const allSetsCompleted = completedSets === config.sets;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
            {config.displayName}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {config.isBodyweight
              ? `${config.sets} sets to failure`
              : `${config.sets} x ${config.targetReps} reps`}
          </p>
        </div>
        {!config.isBodyweight && (
          <WeightInput
            weight={weight}
            unit={unit}
            onChange={onWeightChange}
            disabled={allSetsCompleted}
          />
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        {Array.from({ length: config.sets }).map((_, index) => (
          <div key={index} className="relative">
            {editingSet === index ? (
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  placeholder="reps"
                  autoFocus
                  className="w-14 h-14 text-center text-lg font-bold border-2 border-blue-500 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleEditSubmit(index);
                    if (e.key === 'Escape') setEditingSet(null);
                  }}
                />
                <button
                  onClick={() => handleEditSubmit(index)}
                  className="w-8 h-8 rounded bg-blue-500 text-white text-sm font-bold"
                >
                  OK
                </button>
              </div>
            ) : (
              <SetButton
                setNumber={index + 1}
                reps={sets[index]}
                targetReps={config.targetReps}
                isBodyweight={config.isBodyweight}
                onComplete={(reps) => handleSetClick(index, reps)}
                onEdit={() => {
                  setEditingSet(index);
                  setEditValue(sets[index]?.toString() || '');
                }}
              />
            )}
          </div>
        ))}
      </div>

      {config.isBodyweight && totalReps > 0 && (
        <p className="mt-3 text-sm font-medium text-gray-600 dark:text-gray-400">
          Total: {totalReps} reps
        </p>
      )}

      {allSetsCompleted && (
        <div className="mt-3 flex items-center gap-2 text-green-600 dark:text-green-400">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span className="text-sm font-medium">Complete</span>
        </div>
      )}
    </div>
  );
}

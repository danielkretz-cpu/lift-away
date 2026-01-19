'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAppState, addBodyWeightEntry } from '@/lib/storage';
import { EXERCISES } from '@/lib/constants';
import { getWorkoutStreak } from '@/lib/progression';
import { AppState } from '@/types';
import Navigation from '@/components/Navigation';
import ProgressChart from '@/components/ProgressChart';
import BodyWeightChart from '@/components/BodyWeightChart';
import BodyWeightModal from '@/components/BodyWeightModal';

export default function ProgressPage() {
  const router = useRouter();
  const [appState, setAppState] = useState<AppState | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWeightModal, setShowWeightModal] = useState(false);

  useEffect(() => {
    const state = getAppState();
    if (!state) {
      router.push('/onboarding');
      return;
    }
    setAppState(state);
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </main>
    );
  }

  if (!appState) {
    return null;
  }

  const streak = getWorkoutStreak(appState.workoutHistory);
  const totalWorkouts = appState.workoutHistory.length;

  const handleSaveBodyWeight = (weight: number) => {
    const updatedState = addBodyWeightEntry(weight);
    if (updatedState) {
      setAppState(updatedState);
    }
  };

  // Calculate total volume (rough estimate)
  const totalVolume = appState.workoutHistory.reduce((total, workout) => {
    let workoutVolume = 0;
    Object.entries(workout.exercises).forEach(([name, exercise]) => {
      if (exercise && !EXERCISES[name]?.isBodyweight) {
        const reps = exercise.sets.reduce((sum: number, r: number) => sum + r, 0);
        workoutVolume += exercise.weight * reps;
      }
    });
    return total + workoutVolume;
  }, 0);

  const exercises = ['squat', 'benchPress', 'overheadPress', 'barbellRow', 'deadlift'];

  return (
    <main className="min-h-screen pb-20 bg-gray-50 dark:bg-gray-900">
      <div className="p-4 max-w-md mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Progress
          </h1>
          <button
            onClick={() => setShowWeightModal(true)}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Log Weight
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {totalWorkouts}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Workouts</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {streak}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Streak</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {totalVolume > 1000 ? `${(totalVolume / 1000).toFixed(0)}k` : totalVolume}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Volume ({appState.profile.unit})</p>
          </div>
        </div>

        {/* Body Weight Tracking */}
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Body Weight
        </h2>
        <div className="mb-8">
          <BodyWeightChart
            bodyWeightHistory={appState.bodyWeightHistory || []}
            unit={appState.profile.unit}
          />
        </div>

        {/* Current Weights */}
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Current Working Weights
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-8 overflow-hidden">
          {exercises.map((exerciseName, index) => {
            const config = EXERCISES[exerciseName];
            const weight =
              appState.currentWeights[exerciseName as keyof typeof appState.currentWeights];
            return (
              <div
                key={exerciseName}
                className={`flex justify-between items-center p-4 ${
                  index < exercises.length - 1
                    ? 'border-b border-gray-100 dark:border-gray-700'
                    : ''
                }`}
              >
                <span className="font-medium text-gray-900 dark:text-white">
                  {config.displayName}
                </span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {weight} {appState.profile.unit}
                </span>
              </div>
            );
          })}
        </div>

        {/* Progress Charts */}
        {totalWorkouts > 0 && (
          <>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Weight Progression
            </h2>
            <div className="space-y-4">
              {exercises.map((exerciseName) => (
                <ProgressChart
                  key={exerciseName}
                  workoutHistory={appState.workoutHistory}
                  exerciseName={exerciseName}
                  unit={appState.profile.unit}
                />
              ))}
            </div>
          </>
        )}

        {totalWorkouts === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Complete your first workout to see progress charts!
            </p>
            <button
              onClick={() => router.push('/')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              Start Workout
            </button>
          </div>
        )}
      </div>
      <Navigation />

      {/* Body Weight Modal */}
      <BodyWeightModal
        isOpen={showWeightModal}
        onClose={() => setShowWeightModal(false)}
        onSave={handleSaveBodyWeight}
        currentWeight={appState.profile.bodyWeight}
        unit={appState.profile.unit}
      />
    </main>
  );
}

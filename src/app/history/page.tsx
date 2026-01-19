'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAppState, updateWorkoutInHistory } from '@/lib/storage';
import { EXERCISES } from '@/lib/constants';
import { getTotalReps } from '@/lib/progression';
import { AppState, WorkoutLog } from '@/types';
import Navigation from '@/components/Navigation';

export default function HistoryPage() {
  const router = useRouter();
  const [appState, setAppState] = useState<AppState | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutLog | null>(null);

  useEffect(() => {
    const state = getAppState();
    if (!state) {
      router.push('/onboarding');
      return;
    }
    setAppState(state);
    setLoading(false);
  }, [router]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

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

  const sortedHistory = [...appState.workoutHistory].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (selectedWorkout) {
    const exercises = Object.entries(selectedWorkout.exercises).filter(
      ([, log]) => log !== undefined
    );

    return (
      <main className="min-h-screen pb-20 bg-gray-50 dark:bg-gray-900">
        <div className="p-4 max-w-md mx-auto">
          <button
            onClick={() => setSelectedWorkout(null)}
            className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-4"
          >
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to History
          </button>

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Workout {selectedWorkout.type}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              {formatDate(selectedWorkout.date)} at {formatTime(selectedWorkout.date)}
            </p>
          </div>

          <div className="space-y-4">
            {exercises.map(([exerciseName, log]) => {
              if (!log) return null;
              const config = EXERCISES[exerciseName];
              return (
                <div
                  key={exerciseName}
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {config.displayName}
                    </h3>
                    {!config.isBodyweight && (
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {log.weight} {appState.profile.unit}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {log.sets.map((reps: number, index: number) => (
                      <span
                        key={index}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                          config.isBodyweight || reps >= config.targetReps
                            ? 'bg-green-500 text-white'
                            : 'bg-yellow-500 text-white'
                        }`}
                      >
                        {reps}
                      </span>
                    ))}
                  </div>

                  {config.isBodyweight && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      Total: {getTotalReps(log.sets)} reps
                    </p>
                  )}

                  <div className="mt-2 flex items-center gap-2">
                    {log.completed ? (
                      <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
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
                        Completed
                      </span>
                    ) : (
                      <span className="text-sm text-yellow-600 dark:text-yellow-400">
                        Incomplete
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <Navigation />
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-20 bg-gray-50 dark:bg-gray-900">
      <div className="p-4 max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Workout History
        </h1>

        {sortedHistory.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No workouts yet. Start your first workout!
            </p>
            <button
              onClick={() => router.push('/')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              Go to Workout
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedHistory.map((workout) => {
              const exerciseNames = Object.keys(workout.exercises)
                .filter((name) => workout.exercises[name as keyof typeof workout.exercises])
                .map((name) => EXERCISES[name]?.displayName || name);

              return (
                <button
                  key={workout.id}
                  onClick={() => setSelectedWorkout(workout)}
                  className="w-full bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm text-left hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Workout {workout.type}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(workout.date)}
                      </p>
                    </div>
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {exerciseNames.join(', ')}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </div>
      <Navigation />
    </main>
  );
}

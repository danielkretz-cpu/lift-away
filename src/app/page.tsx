'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAppState, saveAppState, generateWorkoutId } from '@/lib/storage';
import { EXERCISES, WORKOUT_A_EXERCISES, WORKOUT_B_EXERCISES } from '@/lib/constants';
import { isExerciseCompleted, calculateProgression } from '@/lib/progression';
import { AppState, WorkoutLog, ExerciseLog, ExerciseName } from '@/types';
import ExerciseCard from '@/components/ExerciseCard';
import Navigation from '@/components/Navigation';

type WorkoutExercise = typeof WORKOUT_A_EXERCISES[number] | typeof WORKOUT_B_EXERCISES[number];

export default function Home() {
  const router = useRouter();
  const [appState, setAppState] = useState<AppState | null>(null);
  const [loading, setLoading] = useState(true);
  const [workoutInProgress, setWorkoutInProgress] = useState(false);
  const [currentWorkout, setCurrentWorkout] = useState<{
    type: 'A' | 'B';
    exercises: Record<string, { weight: number; sets: (number | null)[] }>;
  } | null>(null);

  useEffect(() => {
    const state = getAppState();
    if (!state) {
      router.push('/onboarding');
      return;
    }
    setAppState(state);
    setLoading(false);
  }, [router]);

  const startWorkout = () => {
    if (!appState) return;

    const workoutType = appState.nextWorkoutType;
    const exercises = workoutType === 'A' ? WORKOUT_A_EXERCISES : WORKOUT_B_EXERCISES;

    const initialExercises: Record<string, { weight: number; sets: (number | null)[] }> = {};

    exercises.forEach((exerciseName) => {
      const config = EXERCISES[exerciseName];
      const weight = exerciseName === 'pullups' ? 0 : appState.currentWeights[exerciseName as keyof typeof appState.currentWeights];
      initialExercises[exerciseName] = {
        weight,
        sets: Array(config.sets).fill(null),
      };
    });

    setCurrentWorkout({ type: workoutType, exercises: initialExercises });
    setWorkoutInProgress(true);
  };

  const handleWeightChange = (exerciseName: string, weight: number) => {
    if (!currentWorkout) return;
    setCurrentWorkout({
      ...currentWorkout,
      exercises: {
        ...currentWorkout.exercises,
        [exerciseName]: {
          ...currentWorkout.exercises[exerciseName],
          weight,
        },
      },
    });
  };

  const handleSetComplete = (exerciseName: string, setIndex: number, reps: number) => {
    if (!currentWorkout) return;
    const newSets = [...currentWorkout.exercises[exerciseName].sets];
    newSets[setIndex] = reps;
    setCurrentWorkout({
      ...currentWorkout,
      exercises: {
        ...currentWorkout.exercises,
        [exerciseName]: {
          ...currentWorkout.exercises[exerciseName],
          sets: newSets,
        },
      },
    });
  };

  const isWorkoutComplete = () => {
    if (!currentWorkout) return false;
    return Object.entries(currentWorkout.exercises).every(([, exercise]) => {
      return exercise.sets.every((s) => s !== null);
    });
  };

  const finishWorkout = () => {
    if (!currentWorkout || !appState) return;

    const workoutLog: WorkoutLog = {
      id: generateWorkoutId(),
      date: new Date().toISOString(),
      type: currentWorkout.type,
      exercises: {
        squat: createExerciseLog('squat'),
        pullups: createExerciseLog('pullups'),
      },
    };

    if (currentWorkout.type === 'A') {
      workoutLog.exercises.benchPress = createExerciseLog('benchPress');
      workoutLog.exercises.barbellRow = createExerciseLog('barbellRow');
    } else {
      workoutLog.exercises.overheadPress = createExerciseLog('overheadPress');
      workoutLog.exercises.deadlift = createExerciseLog('deadlift');
    }

    // Calculate exercise results for progression
    const exerciseResults: Record<string, { completed: boolean; failureCount: number }> = {};

    Object.keys(currentWorkout.exercises).forEach((exerciseName) => {
      const exerciseData = currentWorkout.exercises[exerciseName];
      const completedSets = exerciseData.sets.filter((s): s is number => s !== null);
      const exerciseLog: ExerciseLog = {
        weight: exerciseData.weight,
        sets: completedSets,
        completed: isExerciseCompleted(
          { weight: exerciseData.weight, sets: completedSets, completed: false },
          exerciseName as ExerciseName
        ),
      };

      const wasSuccessful = exerciseLog.completed;
      const currentFailures = appState.failureCounts[exerciseName] || 0;

      exerciseResults[exerciseName] = {
        completed: wasSuccessful,
        failureCount: wasSuccessful ? 0 : currentFailures + 1,
      };
    });

    // Calculate new weights
    const { newWeights, deloads } = calculateProgression(
      appState.currentWeights,
      exerciseResults
    );

    // Update app state
    const newState: AppState = {
      ...appState,
      currentWeights: newWeights,
      workoutHistory: [...appState.workoutHistory, workoutLog],
      nextWorkoutType: currentWorkout.type === 'A' ? 'B' : 'A',
      failureCounts: Object.fromEntries(
        Object.entries(exerciseResults).map(([name, result]) => [
          name,
          result.completed ? 0 : result.failureCount,
        ])
      ),
    };

    saveAppState(newState);
    setAppState(newState);
    setCurrentWorkout(null);
    setWorkoutInProgress(false);

    if (deloads.length > 0) {
      alert(`Deload applied for: ${deloads.join(', ')}`);
    }
  };

  const createExerciseLog = (exerciseName: string): ExerciseLog => {
    const exerciseData = currentWorkout!.exercises[exerciseName];
    const completedSets = exerciseData.sets.filter((s): s is number => s !== null);
    return {
      weight: exerciseData.weight,
      sets: completedSets,
      completed: isExerciseCompleted(
        { weight: exerciseData.weight, sets: completedSets, completed: false },
        exerciseName as ExerciseName
      ),
    };
  };

  const cancelWorkout = () => {
    if (confirm('Are you sure you want to cancel this workout?')) {
      setCurrentWorkout(null);
      setWorkoutInProgress(false);
    }
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

  if (!workoutInProgress) {
    const exercises =
      appState.nextWorkoutType === 'A' ? WORKOUT_A_EXERCISES : WORKOUT_B_EXERCISES;

    return (
      <main className="min-h-screen pb-20 bg-gray-50 dark:bg-gray-900">
        <div className="p-4 max-w-md mx-auto">
          {/* Minecraft-inspired Banner */}
          <div
            style={{
              background: 'linear-gradient(90deg, #5E9C3F 0%, #79C05A 100%)',
              border: '4px solid #3C511B',
              boxShadow: '0 4px 16px #0008',
              fontFamily: '"Press Start 2P", "VT323", monospace',
              color: '#fff',
              textShadow: '2px 2px 0 #3C511B, 4px 4px 0 #0008',
              fontSize: '2rem',
              letterSpacing: '2px',
              padding: '1.2rem 0',
              marginBottom: '2rem',
              borderRadius: '12px',
              textAlign: 'center',
              userSelect: 'none',
            }}
          >
            <span role="img" aria-label="grass block" style={{marginRight: 12}}>🟩</span>
            Vibez by Kretz
            <span role="img" aria-label="grass block" style={{marginLeft: 12}}>🟩</span>
          </div>
          {/* End Minecraft Banner */}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            Next Workout
          </h1>
          <p className="text-lg font-medium text-blue-600 dark:text-blue-400 mb-6">
            Workout {appState.nextWorkoutType}
          </p>

          <div className="space-y-3 mb-8">
            {exercises.map((exerciseName) => {
              const config = EXERCISES[exerciseName];
              const weight =
                exerciseName === 'pullups'
                  ? null
                  : appState.currentWeights[exerciseName as keyof typeof appState.currentWeights];
              return (
                <div
                  key={exerciseName}
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {config.displayName}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {config.isBodyweight
                        ? `${config.sets} sets to failure`
                        : `${config.sets} x ${config.targetReps} reps`}
                    </p>
                  </div>
                  {weight !== null && (
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {weight} {appState.profile.unit}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <button
            onClick={startWorkout}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors text-lg"
          >
            Start Workout
          </button>
        </div>
        <Navigation />
      </main>
    );
  }

  const exercises =
    currentWorkout?.type === 'A' ? WORKOUT_A_EXERCISES : WORKOUT_B_EXERCISES;

  return (
    <main className="min-h-screen pb-24 bg-gray-50 dark:bg-gray-900">
      <div className="p-4 max-w-md mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Workout {currentWorkout?.type}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {new Date().toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={cancelWorkout}
            className="text-red-500 hover:text-red-600 font-medium"
          >
            Cancel
          </button>
        </div>

        <div className="space-y-4 mb-8">
          {exercises.map((exerciseName) => {
            const config = EXERCISES[exerciseName];
            const exerciseData = currentWorkout?.exercises[exerciseName];
            if (!exerciseData) return null;

            return (
              <ExerciseCard
                key={exerciseName}
                config={config}
                weight={exerciseData.weight}
                unit={appState.profile.unit}
                sets={exerciseData.sets}
                onWeightChange={(weight) => handleWeightChange(exerciseName, weight)}
                onSetComplete={(setIndex, reps) =>
                  handleSetComplete(exerciseName, setIndex, reps)
                }
              />
            );
          })}
        </div>

        <button
          onClick={finishWorkout}
          disabled={!isWorkoutComplete()}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-colors text-lg"
        >
          {isWorkoutComplete() ? 'Finish Workout' : 'Complete all sets to finish'}
        </button>
      </div>
    </main>
  );
}

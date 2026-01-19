import { ExerciseLog, CurrentWeights, ExerciseName } from '@/types';
import { EXERCISES, DELOAD_PERCENTAGE, MAX_FAILURES_BEFORE_DELOAD } from './constants';

export function isExerciseCompleted(exercise: ExerciseLog, exerciseName: ExerciseName): boolean {
  const config = EXERCISES[exerciseName];
  if (!config) return false;

  // For pullups, any completion counts as success (we track reps to failure)
  if (config.isBodyweight) {
    return exercise.sets.length === config.sets;
  }

  // For regular exercises, check if all sets hit target reps
  const targetReps = config.targetReps;
  return exercise.sets.length === config.sets &&
         exercise.sets.every(reps => reps >= targetReps);
}

export function calculateNextWeight(
  currentWeight: number,
  exerciseName: ExerciseName,
  wasSuccessful: boolean,
  consecutiveFailures: number
): { weight: number; deloaded: boolean } {
  const config = EXERCISES[exerciseName];
  if (!config || config.isBodyweight) {
    return { weight: currentWeight, deloaded: false };
  }

  if (wasSuccessful) {
    return {
      weight: currentWeight + config.weightIncrement,
      deloaded: false,
    };
  }

  // Check if deload is needed (3 consecutive failures)
  if (consecutiveFailures >= MAX_FAILURES_BEFORE_DELOAD) {
    const deloadedWeight = Math.floor((currentWeight * (1 - DELOAD_PERCENTAGE)) / 5) * 5;
    return {
      weight: Math.max(deloadedWeight, config.name === 'deadlift' ? 95 : 45),
      deloaded: true,
    };
  }

  // Keep same weight
  return { weight: currentWeight, deloaded: false };
}

export function calculateProgression(
  currentWeights: CurrentWeights,
  exerciseResults: Record<string, { completed: boolean; failureCount: number }>
): { newWeights: CurrentWeights; deloads: string[] } {
  const newWeights = { ...currentWeights };
  const deloads: string[] = [];

  for (const [exerciseName, result] of Object.entries(exerciseResults)) {
    if (exerciseName === 'pullups') continue;

    const key = exerciseName as keyof CurrentWeights;
    const { weight, deloaded } = calculateNextWeight(
      currentWeights[key],
      exerciseName as ExerciseName,
      result.completed,
      result.failureCount
    );

    newWeights[key] = weight;
    if (deloaded) {
      deloads.push(EXERCISES[exerciseName].displayName);
    }
  }

  return { newWeights, deloads };
}

export function getWorkoutStreak(workoutHistory: { date: string }[]): number {
  if (workoutHistory.length === 0) return 0;

  // Sort by date descending
  const sorted = [...workoutHistory].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  let streak = 1;
  let lastDate = new Date(sorted[0].date);

  for (let i = 1; i < sorted.length; i++) {
    const currentDate = new Date(sorted[i].date);
    const diffDays = Math.floor(
      (lastDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Allow up to 3 days gap (rest days)
    if (diffDays <= 3) {
      streak++;
      lastDate = currentDate;
    } else {
      break;
    }
  }

  return streak;
}

export function formatWeight(weight: number, unit: 'lbs' | 'kg'): string {
  return `${weight} ${unit}`;
}

export function getTotalReps(sets: number[]): number {
  return sets.reduce((sum, reps) => sum + reps, 0);
}

export function getExerciseDisplayName(exerciseName: string): string {
  return EXERCISES[exerciseName]?.displayName || exerciseName;
}

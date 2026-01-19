import { ExerciseConfig, CurrentWeights } from '@/types';

export const EXERCISES: Record<string, ExerciseConfig> = {
  squat: {
    name: 'squat',
    displayName: 'Squat',
    sets: 5,
    targetReps: 5,
    weightIncrement: 5,
  },
  benchPress: {
    name: 'benchPress',
    displayName: 'Bench Press',
    sets: 5,
    targetReps: 5,
    weightIncrement: 5,
  },
  overheadPress: {
    name: 'overheadPress',
    displayName: 'Overhead Press',
    sets: 5,
    targetReps: 5,
    weightIncrement: 5,
  },
  barbellRow: {
    name: 'barbellRow',
    displayName: 'Barbell Row',
    sets: 5,
    targetReps: 5,
    weightIncrement: 5,
  },
  deadlift: {
    name: 'deadlift',
    displayName: 'Deadlift',
    sets: 1,
    targetReps: 5,
    weightIncrement: 10,
  },
  pullups: {
    name: 'pullups',
    displayName: 'Pull-ups',
    sets: 3,
    targetReps: 0, // to failure
    weightIncrement: 0,
    isBodyweight: true,
  },
};

export const DEFAULT_STARTING_WEIGHTS: CurrentWeights = {
  squat: 45,
  benchPress: 45,
  overheadPress: 45,
  barbellRow: 65,
  deadlift: 95,
};

// Workout A: Squat, Bench Press, Barbell Row, Pull-ups
export const WORKOUT_A_EXERCISES = ['squat', 'benchPress', 'barbellRow', 'pullups'] as const;

// Workout B: Squat, Overhead Press, Deadlift, Pull-ups
export const WORKOUT_B_EXERCISES = ['squat', 'overheadPress', 'deadlift', 'pullups'] as const;

export const STORAGE_KEY = 'stronglifts-tracker-state';

export const DELOAD_PERCENTAGE = 0.10; // 10% deload after 3 failures
export const MAX_FAILURES_BEFORE_DELOAD = 3;

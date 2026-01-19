export interface UserProfile {
  bodyWeight: number;
  startDate: string;
  unit: 'lbs' | 'kg';
}

export interface ExerciseLog {
  weight: number;
  sets: number[]; // reps completed per set, e.g., [5, 5, 5, 5, 5]
  completed: boolean; // true if all target reps hit
}

export interface WorkoutExercises {
  squat: ExerciseLog;
  benchPress?: ExerciseLog; // only in Workout A
  overheadPress?: ExerciseLog; // only in Workout B
  barbellRow?: ExerciseLog; // only in Workout A
  deadlift?: ExerciseLog; // only in Workout B
  pullups: ExerciseLog;
}

export interface WorkoutLog {
  id: string;
  date: string;
  type: 'A' | 'B';
  exercises: WorkoutExercises;
}

export interface CurrentWeights {
  squat: number;
  benchPress: number;
  overheadPress: number;
  barbellRow: number;
  deadlift: number;
}

export interface BodyWeightEntry {
  id: string;
  date: string;
  weight: number;
}

export interface AppState {
  profile: UserProfile;
  currentWeights: CurrentWeights;
  workoutHistory: WorkoutLog[];
  bodyWeightHistory: BodyWeightEntry[];
  nextWorkoutType: 'A' | 'B';
  failureCounts: Record<string, number>; // track consecutive failures
}

export type ExerciseName = 'squat' | 'benchPress' | 'overheadPress' | 'barbellRow' | 'deadlift' | 'pullups';

export interface ExerciseConfig {
  name: ExerciseName;
  displayName: string;
  sets: number;
  targetReps: number;
  weightIncrement: number; // lbs to add on success
  isBodyweight?: boolean; // true for pullups
}

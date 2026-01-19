import { AppState, WorkoutLog, CurrentWeights, UserProfile, BodyWeightEntry } from '@/types';
import { STORAGE_KEY, DEFAULT_STARTING_WEIGHTS } from './constants';

export function getAppState(): AppState | null {
  if (typeof window === 'undefined') return null;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored) as AppState;
  } catch {
    return null;
  }
}

export function saveAppState(state: AppState): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function initializeAppState(
  profile: UserProfile,
  startingWeights?: Partial<CurrentWeights>
): AppState {
  const state: AppState = {
    profile,
    currentWeights: {
      ...DEFAULT_STARTING_WEIGHTS,
      ...startingWeights,
    },
    workoutHistory: [],
    bodyWeightHistory: [],
    nextWorkoutType: 'A',
    failureCounts: {},
  };

  saveAppState(state);
  return state;
}

export function addWorkoutToHistory(workout: WorkoutLog): AppState | null {
  const state = getAppState();
  if (!state) return null;

  state.workoutHistory.push(workout);
  state.nextWorkoutType = workout.type === 'A' ? 'B' : 'A';

  saveAppState(state);
  return state;
}

export function updateCurrentWeights(weights: Partial<CurrentWeights>): AppState | null {
  const state = getAppState();
  if (!state) return null;

  state.currentWeights = {
    ...state.currentWeights,
    ...weights,
  };

  saveAppState(state);
  return state;
}

export function updateFailureCount(exerciseName: string, increment: boolean): AppState | null {
  const state = getAppState();
  if (!state) return null;

  if (increment) {
    state.failureCounts[exerciseName] = (state.failureCounts[exerciseName] || 0) + 1;
  } else {
    state.failureCounts[exerciseName] = 0;
  }

  saveAppState(state);
  return state;
}

export function updateWorkoutInHistory(workoutId: string, updatedWorkout: WorkoutLog): AppState | null {
  const state = getAppState();
  if (!state) return null;

  const index = state.workoutHistory.findIndex(w => w.id === workoutId);
  if (index === -1) return null;

  state.workoutHistory[index] = updatedWorkout;
  saveAppState(state);
  return state;
}

export function clearAppState(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

export function generateWorkoutId(): string {
  return `workout-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function generateBodyWeightId(): string {
  return `bw-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function addBodyWeightEntry(weight: number): AppState | null {
  const state = getAppState();
  if (!state) return null;

  // Initialize bodyWeightHistory if it doesn't exist (for backwards compatibility)
  if (!state.bodyWeightHistory) {
    state.bodyWeightHistory = [];
  }

  const entry: BodyWeightEntry = {
    id: generateBodyWeightId(),
    date: new Date().toISOString(),
    weight,
  };

  state.bodyWeightHistory.push(entry);
  
  // Also update profile body weight to latest
  state.profile.bodyWeight = weight;

  saveAppState(state);
  return state;
}

export function deleteBodyWeightEntry(entryId: string): AppState | null {
  const state = getAppState();
  if (!state || !state.bodyWeightHistory) return null;

  state.bodyWeightHistory = state.bodyWeightHistory.filter(e => e.id !== entryId);
  saveAppState(state);
  return state;
}

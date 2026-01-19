import { getSupabase } from './supabase';
import { AppState, WorkoutLog, CurrentWeights, UserProfile, BodyWeightEntry } from '@/types';
import { DEFAULT_STARTING_WEIGHTS } from './constants';

const supabase = getSupabase();

// ============================================
// Profile Operations
// ============================================

export async function getProfile(userId: string): Promise<AppState | null> {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !profile) return null;

  // Get workout history
  const { data: workouts } = await supabase
    .from('workouts')
    .select('*')
    .eq('user_id', userId)
    .order('workout_date', { ascending: true });

  // Get body weight history
  const { data: bodyWeightEntries } = await supabase
    .from('body_weight_entries')
    .select('*')
    .eq('user_id', userId)
    .order('recorded_at', { ascending: true });

  // Transform to AppState format
  const appState: AppState = {
    profile: {
      bodyWeight: Number(profile.body_weight),
      startDate: profile.start_date,
      unit: profile.unit as 'lbs' | 'kg',
    },
    currentWeights: profile.current_weights as CurrentWeights,
    workoutHistory: (workouts || []).map((w) => ({
      id: w.id,
      date: w.workout_date,
      type: w.workout_type as 'A' | 'B',
      exercises: w.exercises,
    })),
    bodyWeightHistory: (bodyWeightEntries || []).map((e) => ({
      id: e.id,
      date: e.recorded_at,
      weight: Number(e.weight),
    })),
    nextWorkoutType: profile.next_workout_type as 'A' | 'B',
    failureCounts: profile.failure_counts || {},
  };

  return appState;
}

export async function createProfile(
  userId: string,
  profileData: UserProfile,
  startingWeights?: Partial<CurrentWeights>
): Promise<boolean> {
  const { error } = await supabase.from('profiles').upsert({
    id: userId,
    body_weight: profileData.bodyWeight,
    unit: profileData.unit,
    start_date: profileData.startDate,
    current_weights: {
      ...DEFAULT_STARTING_WEIGHTS,
      ...startingWeights,
    },
    next_workout_type: 'A',
    failure_counts: {},
  });

  return !error;
}

export async function updateProfile(
  userId: string,
  updates: {
    currentWeights?: CurrentWeights;
    nextWorkoutType?: 'A' | 'B';
    failureCounts?: Record<string, number>;
    bodyWeight?: number;
  }
): Promise<boolean> {
  const updateData: Record<string, unknown> = {};
  
  if (updates.currentWeights) updateData.current_weights = updates.currentWeights;
  if (updates.nextWorkoutType) updateData.next_workout_type = updates.nextWorkoutType;
  if (updates.failureCounts) updateData.failure_counts = updates.failureCounts;
  if (updates.bodyWeight) updateData.body_weight = updates.bodyWeight;

  const { error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', userId);

  return !error;
}

// ============================================
// Workout Operations
// ============================================

export async function addWorkout(
  userId: string,
  workout: Omit<WorkoutLog, 'id'>
): Promise<WorkoutLog | null> {
  const { data, error } = await supabase
    .from('workouts')
    .insert({
      user_id: userId,
      workout_date: workout.date,
      workout_type: workout.type,
      exercises: workout.exercises,
    })
    .select()
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    date: data.workout_date,
    type: data.workout_type as 'A' | 'B',
    exercises: data.exercises,
  };
}

export async function updateWorkout(
  userId: string,
  workoutId: string,
  workout: Partial<WorkoutLog>
): Promise<boolean> {
  const updateData: Record<string, unknown> = {};
  
  if (workout.date) updateData.workout_date = workout.date;
  if (workout.type) updateData.workout_type = workout.type;
  if (workout.exercises) updateData.exercises = workout.exercises;

  const { error } = await supabase
    .from('workouts')
    .update(updateData)
    .eq('id', workoutId)
    .eq('user_id', userId);

  return !error;
}

export async function deleteWorkout(userId: string, workoutId: string): Promise<boolean> {
  const { error } = await supabase
    .from('workouts')
    .delete()
    .eq('id', workoutId)
    .eq('user_id', userId);

  return !error;
}

// ============================================
// Body Weight Operations
// ============================================

export async function addBodyWeight(
  userId: string,
  weight: number
): Promise<BodyWeightEntry | null> {
  const { data, error } = await supabase
    .from('body_weight_entries')
    .insert({
      user_id: userId,
      weight: weight,
      recorded_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error || !data) return null;

  // Also update profile body weight
  await supabase
    .from('profiles')
    .update({ body_weight: weight })
    .eq('id', userId);

  return {
    id: data.id,
    date: data.recorded_at,
    weight: Number(data.weight),
  };
}

export async function deleteBodyWeight(
  userId: string,
  entryId: string
): Promise<boolean> {
  const { error } = await supabase
    .from('body_weight_entries')
    .delete()
    .eq('id', entryId)
    .eq('user_id', userId);

  return !error;
}

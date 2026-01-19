'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { AppState, WorkoutLog, CurrentWeights, UserProfile, BodyWeightEntry } from '@/types';
import * as localStorage from '@/lib/storage';
import * as supabaseStorage from '@/lib/supabase-storage';

export function useAppState() {
  const { user, loading: authLoading } = useAuth();
  const [appState, setAppState] = useState<AppState | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Load state from appropriate source
  const loadState = useCallback(async () => {
    setLoading(true);
    
    if (user) {
      // User is logged in - try Supabase first
      const cloudState = await supabaseStorage.getProfile(user.id);
      if (cloudState) {
        setAppState(cloudState);
        // Also sync to localStorage for offline access
        localStorage.saveAppState(cloudState);
      } else {
        // Check if we have local data to migrate
        const localState = localStorage.getAppState();
        if (localState) {
          // Migrate local data to cloud
          await supabaseStorage.createProfile(user.id, localState.profile, localState.currentWeights);
          
          // Migrate workouts
          for (const workout of localState.workoutHistory) {
            await supabaseStorage.addWorkout(user.id, workout);
          }
          
          // Migrate body weight entries
          if (localState.bodyWeightHistory) {
            for (const entry of localState.bodyWeightHistory) {
              await supabaseStorage.addBodyWeight(user.id, entry.weight);
            }
          }
          
          setAppState(localState);
        }
      }
    } else if (!authLoading) {
      // Not logged in - use localStorage
      const localState = localStorage.getAppState();
      setAppState(localState);
    }
    
    setLoading(false);
  }, [user, authLoading]);

  useEffect(() => {
    if (!authLoading) {
      loadState();
    }
  }, [authLoading, loadState]);

  // Initialize new profile (onboarding)
  const initializeState = useCallback(async (
    profile: UserProfile,
    startingWeights?: Partial<CurrentWeights>
  ): Promise<AppState> => {
    const newState = localStorage.initializeAppState(profile, startingWeights);
    
    if (user) {
      await supabaseStorage.createProfile(user.id, profile, startingWeights);
    }
    
    setAppState(newState);
    return newState;
  }, [user]);

  // Add workout
  const addWorkout = useCallback(async (workout: WorkoutLog): Promise<AppState | null> => {
    const newState = localStorage.addWorkoutToHistory(workout);
    
    if (user && newState) {
      setSyncing(true);
      await supabaseStorage.addWorkout(user.id, workout);
      await supabaseStorage.updateProfile(user.id, {
        currentWeights: newState.currentWeights,
        nextWorkoutType: newState.nextWorkoutType,
        failureCounts: newState.failureCounts,
      });
      setSyncing(false);
    }
    
    setAppState(newState);
    return newState;
  }, [user]);

  // Update current weights
  const updateWeights = useCallback(async (weights: Partial<CurrentWeights>): Promise<AppState | null> => {
    const newState = localStorage.updateCurrentWeights(weights);
    
    if (user && newState) {
      await supabaseStorage.updateProfile(user.id, {
        currentWeights: newState.currentWeights,
      });
    }
    
    setAppState(newState);
    return newState;
  }, [user]);

  // Update failure counts
  const updateFailureCount = useCallback(async (exerciseName: string, increment: boolean): Promise<AppState | null> => {
    const newState = localStorage.updateFailureCount(exerciseName, increment);
    
    if (user && newState) {
      await supabaseStorage.updateProfile(user.id, {
        failureCounts: newState.failureCounts,
      });
    }
    
    setAppState(newState);
    return newState;
  }, [user]);

  // Add body weight entry
  const addBodyWeight = useCallback(async (weight: number): Promise<AppState | null> => {
    const newState = localStorage.addBodyWeightEntry(weight);
    
    if (user) {
      await supabaseStorage.addBodyWeight(user.id, weight);
    }
    
    setAppState(newState);
    return newState;
  }, [user]);

  // Update workout in history
  const updateWorkout = useCallback(async (workoutId: string, updatedWorkout: WorkoutLog): Promise<AppState | null> => {
    const newState = localStorage.updateWorkoutInHistory(workoutId, updatedWorkout);
    
    if (user) {
      await supabaseStorage.updateWorkout(user.id, workoutId, updatedWorkout);
    }
    
    setAppState(newState);
    return newState;
  }, [user]);

  // Save full state (for complex updates)
  const saveState = useCallback(async (state: AppState): Promise<void> => {
    localStorage.saveAppState(state);
    
    if (user) {
      await supabaseStorage.updateProfile(user.id, {
        currentWeights: state.currentWeights,
        nextWorkoutType: state.nextWorkoutType,
        failureCounts: state.failureCounts,
        bodyWeight: state.profile.bodyWeight,
      });
    }
    
    setAppState(state);
  }, [user]);

  // Clear all data
  const clearState = useCallback(async (): Promise<void> => {
    localStorage.clearAppState();
    setAppState(null);
  }, []);

  return {
    appState,
    loading: loading || authLoading,
    syncing,
    isAuthenticated: !!user,
    initializeState,
    addWorkout,
    updateWeights,
    updateFailureCount,
    addBodyWeight,
    updateWorkout,
    saveState,
    clearState,
    refreshState: loadState,
  };
}

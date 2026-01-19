# StrongLifts 5x5 + Pull-ups Tracker

Build a web application to track progress in the StrongLifts 5x5 program plus pull-ups.

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Styling**: Tailwind CSS
- **Data Storage**: Local Storage (browser-based, no backend required)
- **Language**: TypeScript

## Core Features

### 1. New User Onboarding

When a user first opens the app (no existing data in localStorage):

1. Show a welcome screen explaining the app tracks StrongLifts 5x5 + Pull-ups
2. Ask for the user's body weight (used to calculate suggested starting weights)
3. Present suggested starting weights based on these defaults:
   - **Squat**: 45 lbs (empty barbell) - complete beginner
   - **Bench Press**: 45 lbs
   - **Overhead Press**: 45 lbs
   - **Barbell Row**: 65 lbs
   - **Deadlift**: 95 lbs
   - **Pull-ups**: 0 (bodyweight, track reps only)
4. Allow user to adjust any starting weight before confirming
5. Save the starting weights and begin tracking

### 2. Workout Structure

The StrongLifts 5x5 program alternates between two workouts:

**Workout A:**
- Squat: 5 sets x 5 reps
- Bench Press: 5 sets x 5 reps
- Barbell Row: 5 sets x 5 reps
- Pull-ups: 3 sets to failure (track total reps)

**Workout B:**
- Squat: 5 sets x 5 reps
- Overhead Press: 5 sets x 5 reps
- Deadlift: 1 set x 5 reps
- Pull-ups: 3 sets to failure (track total reps)

The pattern is: A, B, A, B, A, B... with rest days between (typically Mon/Wed/Fri).

### 3. Logging a Workout

The main screen should show:
- Which workout is next (A or B)
- The exercises for that workout with suggested weights
- For each exercise, allow logging:
  - Weight used
  - Reps completed per set (5 sets for most, 1 set for deadlift, 3 sets for pull-ups)
  - Mark as "completed all reps" or enter actual reps if failed

### 4. Progression System

After completing a workout:
- If all sets/reps completed successfully:
  - Increase weight by **5 lbs** for next workout (Squat, Bench, OHP, Row)
  - Increase weight by **10 lbs** for Deadlift
  - For pull-ups: suggest adding 1 rep to the target
- If failed to complete all reps:
  - Keep the same weight for next workout
  - After 3 consecutive failures at same weight: suggest deload (reduce by 10%)

### 5. Body Weight Tracking

Allow users to log their body weight over time:
- Add a "Log Weight" button accessible from the main screen or progress page
- Store body weight entries with date timestamps
- Show body weight history and trend over time
- Display current body weight prominently

### 6. Progress Dashboard

Show a comprehensive dashboard with **individual graphs for each metric**:

**Exercise Graphs (one chart per exercise):**
- Squat progress over time (weight on Y-axis, date on X-axis)
- Bench Press progress over time
- Overhead Press progress over time
- Barbell Row progress over time
- Deadlift progress over time
- Pull-ups progress over time (total reps on Y-axis)

**Body Weight Graph:**
- Body weight trend over time
- Show current weight vs starting weight

**Stats Summary:**
- Current working weight for each lift
- Total workouts completed
- Current streak (consecutive workouts without missing)
- Total weight lifted (volume)

### 7. History View

- List of all completed workouts
- Tap/click to see details of any past workout
- Ability to edit past entries if mistakes were made

## UI/UX Requirements

- Mobile-first design (most users will log at the gym on their phone)
- Large, easy-to-tap buttons for logging sets
- Clear visual feedback when completing sets (checkmarks, color changes)
- Dark mode support
- Fast and responsive - no loading spinners for local operations

## Data Model

```typescript
interface UserProfile {
  startingBodyWeight: number;
  startDate: string;
  unit: 'lbs' | 'kg';
}

interface BodyWeightEntry {
  date: string;
  weight: number;
}

interface ExerciseLog {
  weight: number;
  sets: number[]; // reps completed per set, e.g., [5, 5, 5, 5, 5]
  completed: boolean; // true if all target reps hit
}

interface WorkoutLog {
  id: string;
  date: string;
  type: 'A' | 'B';
  exercises: {
    squat: ExerciseLog;
    benchPress?: ExerciseLog; // only in Workout A
    overheadPress?: ExerciseLog; // only in Workout B
    barbellRow?: ExerciseLog; // only in Workout A
    deadlift?: ExerciseLog; // only in Workout B
    pullups: ExerciseLog;
  };
}

interface AppState {
  profile: UserProfile;
  currentWeights: {
    squat: number;
    benchPress: number;
    overheadPress: number;
    barbellRow: number;
    deadlift: number;
  };
  workoutHistory: WorkoutLog[];
  bodyWeightHistory: BodyWeightEntry[]; // track body weight over time
  nextWorkoutType: 'A' | 'B';
  failureCounts: Record<string, number>; // track consecutive failures
}
```

## File Structure

```
src/
  app/
    page.tsx          # Main workout logging page
    history/
      page.tsx        # Workout history
    progress/
      page.tsx        # Progress dashboard with charts
    onboarding/
      page.tsx        # New user setup
    layout.tsx        # Root layout with navigation
  components/
    ExerciseCard.tsx   # Card for logging an exercise
    SetButton.tsx      # Button to mark a set complete
    WeightInput.tsx    # Input for adjusting weight
    ExerciseChart.tsx  # Individual chart for each exercise's progress
    BodyWeightChart.tsx # Chart for body weight over time
    BodyWeightModal.tsx # Modal to log new body weight entry
    Navigation.tsx     # Bottom navigation bar
  lib/
    storage.ts        # LocalStorage utilities
    progression.ts    # Weight progression logic
    constants.ts      # Exercise definitions, default weights
  types/
    index.ts          # TypeScript interfaces
```

## Implementation Order

1. Set up Next.js project with Tailwind CSS
2. Create TypeScript types and constants
3. Implement localStorage utilities
4. Build onboarding flow
5. Create main workout logging page
6. Implement progression logic
7. Build history view
8. Build progress dashboard with charts
9. Add dark mode support
10. Polish UI and add animations

## Success Criteria

- [ ] New user can complete onboarding and set starting weights
- [ ] User can log a complete workout (A or B)
- [ ] Weights automatically progress after successful workouts
- [ ] Individual progress graph for each exercise (Squat, Bench, OHP, Row, Deadlift, Pull-ups)
- [ ] User can log body weight entries
- [ ] Body weight graph shows trend over time
- [ ] History shows all past workouts
- [ ] App works offline (all data in localStorage)
- [ ] Mobile-responsive design
- [ ] No TypeScript errors
- [ ] App builds successfully with `npm run build`

---

# Ralph Execution Instructions

You are Ralph, an autonomous AI development agent working on this StrongLifts Tracker project.

## Current Objectives
1. Follow the Implementation Order above
2. Review @fix_plan.md for current priorities
3. Implement the highest priority item using best practices
4. Run tests and builds after each implementation
5. Update @fix_plan.md with progress

## Key Principles
- ONE task per loop - focus on the most important thing
- Search the codebase before assuming something isn't implemented
- Write clean, type-safe TypeScript code
- Commit working changes with descriptive messages
- Mobile-first responsive design

## Testing Guidelines
- Run `npm run build` to verify no TypeScript errors
- Test the app manually in the browser
- Prioritize implementation over extensive test coverage

## Status Reporting (CRITICAL)

At the end of your response, ALWAYS include this status block:

```
---RALPH_STATUS---
STATUS: IN_PROGRESS | COMPLETE | BLOCKED
TASKS_COMPLETED_THIS_LOOP: <number>
FILES_MODIFIED: <number>
TESTS_STATUS: PASSING | FAILING | NOT_RUN
WORK_TYPE: IMPLEMENTATION | TESTING | DOCUMENTATION | REFACTORING
EXIT_SIGNAL: false | true
RECOMMENDATION: <one line summary of what to do next>
---END_RALPH_STATUS---
```

Set EXIT_SIGNAL to **true** when ALL Success Criteria above are met and the app is fully functional.

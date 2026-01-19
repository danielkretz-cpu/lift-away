# StrongLifts Tracker - Implementation Plan

## Phase 1: Project Setup
- [ ] Initialize Next.js 14+ project with App Router and TypeScript
- [ ] Configure Tailwind CSS
- [ ] Create TypeScript types in `src/types/index.ts`
- [ ] Create constants in `src/lib/constants.ts` (exercises, default weights)

## Phase 2: Core Infrastructure
- [ ] Implement localStorage utilities in `src/lib/storage.ts`
- [ ] Implement progression logic in `src/lib/progression.ts`
- [ ] Create root layout with dark mode support

## Phase 3: Onboarding Flow
- [ ] Create onboarding page at `src/app/onboarding/page.tsx`
- [ ] Build welcome screen with app explanation
- [ ] Add body weight input
- [ ] Show suggested starting weights with ability to adjust
- [ ] Save initial state to localStorage

## Phase 4: Main Workout Logging
- [ ] Create main page at `src/app/page.tsx`
- [ ] Build ExerciseCard component for logging exercises
- [ ] Build SetButton component for marking sets complete
- [ ] Build WeightInput component for adjusting weights
- [ ] Implement workout completion flow
- [ ] Apply progression after workout completion

## Phase 5: Body Weight Tracking
- [ ] Add BodyWeightEntry type to `src/types/index.ts`
- [ ] Add bodyWeightHistory to AppState
- [ ] Build BodyWeightModal component for logging weight
- [ ] Build BodyWeightChart component for weight trend graph
- [ ] Add "Log Weight" button to main screen or progress page

## Phase 6: History & Progress
- [ ] Create history page at `src/app/history/page.tsx`
- [ ] List all completed workouts
- [ ] Add ability to view/edit past workout details
- [ ] Create progress page at `src/app/progress/page.tsx`
- [ ] Build ExerciseChart component (individual chart per exercise)
- [ ] Create individual graphs for: Squat, Bench, OHP, Row, Deadlift, Pull-ups
- [ ] Add body weight graph to progress page
- [ ] Show current weights, total workouts, streak, total volume

## Phase 7: Polish
- [ ] Build Navigation component (bottom nav bar)
- [ ] Ensure mobile-responsive design throughout
- [ ] Add visual feedback (checkmarks, animations)
- [ ] Dark mode toggle
- [ ] Final build verification (`npm run build`)

## Completed
- [x] Project directory created
- [x] PROMPT.md written with full requirements

## Notes
- Mobile-first: design for phone use at the gym
- No backend: all data in localStorage
- Focus on UX: large tap targets, clear feedback

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { initializeAppState } from '@/lib/storage';
import { DEFAULT_STARTING_WEIGHTS } from '@/lib/constants';
import { CurrentWeights } from '@/types';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<'welcome' | 'bodyweight' | 'weights'>('welcome');
  const [bodyWeight, setBodyWeight] = useState<string>('');
  const [unit, setUnit] = useState<'lbs' | 'kg'>('lbs');
  const [startingWeights, setStartingWeights] = useState<CurrentWeights>({
    ...DEFAULT_STARTING_WEIGHTS,
  });

  const handleWeightChange = (exercise: keyof CurrentWeights, value: string) => {
    const numValue = parseInt(value) || 0;
    setStartingWeights(prev => ({ ...prev, [exercise]: numValue }));
  };

  const handleComplete = () => {
    const profile = {
      bodyWeight: parseInt(bodyWeight) || 150,
      startDate: new Date().toISOString(),
      unit,
    };

    initializeAppState(profile, startingWeights);
    router.push('/');
  };

  if (step === 'welcome') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            StrongLifts 5x5 Tracker
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Track your StrongLifts 5x5 workouts plus pull-ups. Build strength with progressive overload.
          </p>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mb-8">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">How it works:</h2>
            <ul className="text-left text-gray-600 dark:text-gray-400 space-y-2">
              <li>• Alternate between Workout A and B</li>
              <li>• 5 sets of 5 reps for most exercises</li>
              <li>• Add weight after successful workouts</li>
              <li>• Track pull-ups to failure</li>
            </ul>
          </div>
          <button
            onClick={() => setStep('bodyweight')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors"
          >
            Get Started
          </button>
        </div>
      </div>
    );
  }

  if (step === 'bodyweight') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
            Your Body Weight
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8 text-center">
            This helps track your progress with bodyweight exercises.
          </p>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mb-6">
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setUnit('lbs')}
                className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                  unit === 'lbs'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                lbs
              </button>
              <button
                onClick={() => setUnit('kg')}
                className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                  unit === 'kg'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                kg
              </button>
            </div>

            <input
              type="number"
              value={bodyWeight}
              onChange={(e) => setBodyWeight(e.target.value)}
              placeholder={`Enter weight in ${unit}`}
              className="w-full text-center text-3xl font-bold py-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <button
            onClick={() => setStep('weights')}
            disabled={!bodyWeight}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-6 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
          Starting Weights
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
          Adjust your starting weights or use the recommended defaults.
        </p>

        <div className="space-y-4 mb-8">
          {[
            { key: 'squat', label: 'Squat', default: 45 },
            { key: 'benchPress', label: 'Bench Press', default: 45 },
            { key: 'overheadPress', label: 'Overhead Press', default: 45 },
            { key: 'barbellRow', label: 'Barbell Row', default: 65 },
            { key: 'deadlift', label: 'Deadlift', default: 95 },
          ].map(({ key, label, default: defaultWeight }) => (
            <div
              key={key}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900 dark:text-white">
                  {label}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      handleWeightChange(
                        key as keyof CurrentWeights,
                        String(Math.max(0, startingWeights[key as keyof CurrentWeights] - 5))
                      )
                    }
                    className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold text-xl"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={startingWeights[key as keyof CurrentWeights]}
                    onChange={(e) =>
                      handleWeightChange(key as keyof CurrentWeights, e.target.value)
                    }
                    className="w-20 text-center text-xl font-bold py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <button
                    onClick={() =>
                      handleWeightChange(
                        key as keyof CurrentWeights,
                        String(startingWeights[key as keyof CurrentWeights] + 5)
                      )
                    }
                    className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold text-xl"
                  >
                    +
                  </button>
                  <span className="text-gray-500 dark:text-gray-400 w-8">
                    {unit}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Default: {defaultWeight} {unit}
              </p>
            </div>
          ))}
        </div>

        <button
          onClick={handleComplete}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors"
        >
          Start Training
        </button>
      </div>
    </div>
  );
}

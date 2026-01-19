-- Supabase Database Schema for Lift Away (StrongLifts Tracker)
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- Enable RLS (Row Level Security)
-- Users can only access their own data

-- 1. User Profiles Table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  body_weight DECIMAL(5,1) NOT NULL DEFAULT 150,
  unit TEXT NOT NULL DEFAULT 'lbs' CHECK (unit IN ('lbs', 'kg')),
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  current_weights JSONB NOT NULL DEFAULT '{
    "squat": 45,
    "benchPress": 45,
    "overheadPress": 45,
    "barbellRow": 65,
    "deadlift": 95
  }',
  next_workout_type TEXT NOT NULL DEFAULT 'A' CHECK (next_workout_type IN ('A', 'B')),
  failure_counts JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Workout History Table
CREATE TABLE workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  workout_type TEXT NOT NULL CHECK (workout_type IN ('A', 'B')),
  exercises JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Body Weight History Table
CREATE TABLE body_weight_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  weight DECIMAL(5,1) NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX workouts_user_id_idx ON workouts(user_id);
CREATE INDEX workouts_date_idx ON workouts(workout_date DESC);
CREATE INDEX body_weight_user_id_idx ON body_weight_entries(user_id);
CREATE INDEX body_weight_date_idx ON body_weight_entries(recorded_at DESC);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_weight_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- RLS Policies for workouts
CREATE POLICY "Users can view own workouts" 
  ON workouts FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workouts" 
  ON workouts FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workouts" 
  ON workouts FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workouts" 
  ON workouts FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS Policies for body_weight_entries
CREATE POLICY "Users can view own body weight entries" 
  ON body_weight_entries FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own body weight entries" 
  ON body_weight_entries FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own body weight entries" 
  ON body_weight_entries FOR DELETE 
  USING (auth.uid() = user_id);

-- Function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles updated_at
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

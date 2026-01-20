
# Lift Away: StrongLifts 5x5 + Pull-ups Tracker

Welcome! This is a fun, experimental project by Daniel Kretz, vibing with Ralph (GitHub Copilot) to try out new ideas, tech, and workflows. Expect a mix of serious fitness tracking and playful coding energy.

## 🚀 What is this?

Lift Away is a web app for tracking your progress on the StrongLifts 5x5 program, with extra support for pull-ups and bodyweight logging. It’s built for lifters who want a simple, modern, and mobile-friendly way to log workouts and see their gains.

## 🛠️ Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS
- **Language:** TypeScript
- **Backend:** Supabase (Postgres, Auth, Storage)
- **Deployment:** Vercel

## ✨ Features

- Onboarding flow for new users
- Track StrongLifts 5x5 workouts (A/B split)
- Pull-ups tracking (sets to failure)
- Body weight logging and chart
- Progression logic (auto-increase weights, deloads)
- History and progress pages
- Row Level Security (RLS) for user data in Supabase

## 🧑‍💻 Local Development

1. **Clone the repo:**
	```bash
	git clone https://github.com/danielkretz-cpu/lift-away.git
	cd stronglifts-tracker
	```
2. **Install dependencies:**
	```bash
	npm install
	```
3. **Set up environment variables:**
	- Copy `.env.example` to `.env.local` and fill in your Supabase project details.
	- You need `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from your Supabase dashboard.
4. **Run the app:**
	```bash
	npm run dev
	```
5. **Open [http://localhost:3000](http://localhost:3000) in your browser.**

## 🏋️‍♂️ Database Schema

See [`supabase/schema.sql`](supabase/schema.sql) for the full Postgres schema, including RLS policies and triggers.

## 🚢 Deployment

- **Frontend:** Deployed on Vercel. Connect your GitHub repo to Vercel for automatic deploys on push.
- **Backend:** Supabase project (schema changes must be applied manually via the Supabase SQL Editor).

## 🤝 Why “Vibez by Kretz”?

This project is a playground for Daniel Kretz to experiment with new tech, with a little help from Ralph (GitHub Copilot). It’s about learning, building, and having fun—expect some memes and Minecraft banners along the way!

---

**MIT License**

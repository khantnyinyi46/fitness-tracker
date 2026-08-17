###Fitness Tracker

A simple workout logging app. Users can sign up, log their workouts (exercise, duration, date), and view their progress over time.

Live demo: https://fitness-tracker-1-icuy.onrender.com

Note: this is hosted on Render's free tier, so the first load after a period of inactivity may take 30-60 seconds while the server spins back up.

###Set up Instruction
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

###Tech Stack
-Framework: Next.js (App Router)
-Database & Auth: Supabase (PostgreSQL)
-Session handling: JWT-based sessions (via jose), stored in HTTP-only cookies
-Deployment: Docker, hosted on Render
-CI: GitHub Actions (runs the test suite on every push)

###Features
-Email/password signup and login
-Route protection via middleware — logged-out users are redirected away from protected pages, logged-in users are redirected away from login/signup
-Create, view, and update workout logs
-Session-based auth with server-side session storage

###Getting Started Locally

Clone the repo and install dependencies:
```bash
git clone https://github.com/khantnyinyi46/fitness-tracker
cd fitness-tracker
npm install
```

Create a .env.local file in the root (see .env.example for the full list):
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
SESSION_SECRET=a_random_secret_string_for_signing_sessions
```

SESSION_SECRET needs to be a random string used to sign session JWTs. Generate one with:
```bash
openssl rand -base64 32
```

Run the dev server:
```bash
npm run dev
```

Open http://localhost:3000
Running with Docker


The Supabase URL and publishable key are required at build time (Next.js needs them to build the app), so they must be passed in as build arguments:
```bash
docker build --build-arg NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co --build-arg NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key -t fitness-tracker .
```
Then run the container, passing the same variables (plus SESSION_SECRET) at runtime via an env file:
```bash
docker run -p 3000:3000 --env-file .env.local fitness-tracker
```

###Architecture Notes / What I'd Improve
-Sessions are stored both in an HTTP-only cookie (JWT) and mirrored in a sessions table in Supabase, so sessions can be explicitly invalidated server-side on logout rather than only relying on cookie expiry.
-Route protection is handled centrally in middleware rather than per-page, so protected/public routes are defined in one place.
-If I extended this further, I'd add: rate limiting on the login endpoint, password reset flow, and pagination for the workout history once it grows large.



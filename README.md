# Exam Prep Platform

## Step 1 — Foundation

This is the first build step of the Exam Prep Platform defined in the master flow.

### Included now

- Production-oriented Vanilla JavaScript + Vite structure
- Shared application shell
- Client-side route foundation
- Responsive Home page
- Government Exam entry point
- MNC / IT entry point
- Notes and practice flows
- Local auth + progress persistence
- Supabase-ready backend integration
- Admin content studio for adding topic-level notes and questions
- No backend yet

### Planned next steps

1. Government Exam hierarchy: Exam → Post → Subject → Topic
2. MNC hierarchy: Company → Role → Round → Topic
3. Notes module
4. Question data model
5. PYQ question UI
6. Hint / answer / explanation interaction
7. Supabase database + authentication
8. Admin content management
9. User progress / mistakes / bookmarks
10. Mock tests and analytics

## Supabase-ready backend foundation

The app now includes a backend integration layer that is ready for Supabase without breaking the current local demo flow.

### Setup

1. Copy `.env.example` to `.env`.
2. Add your Supabase project URL and anon key.
3. Run the SQL in `supabase/schema.sql` in your Supabase project.

### Behavior

- If Supabase credentials are present, the app will hydrate an authenticated session, sync the profile and progress snapshot, and protect sensitive routes like Account, Dashboard, and Admin.
- If credentials are absent, the app keeps working with localStorage so development continues without a live service.

### Live project wiring

1. Create a Supabase project and copy the project URL and anon key into `.env`.
2. Run the SQL in `supabase/schema.sql` in the Supabase SQL editor.
3. The schema includes the profile trigger and row-level security policies required for authenticated user sync and progress writes.
4. Sign up or sign in with the app to create a real auth session and verify the profile is persisted.
5. Confirm the saved bookmarks, progress, and test history are being synced through the user-facing auth flow.

## Run locally

```bash
npm install
npm run dev
```

The exact visual design can evolve, but the route and module boundaries should remain connected to the master product flow.

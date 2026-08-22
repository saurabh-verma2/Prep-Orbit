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
- Initial question-engine visual direction
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

## Run locally

```bash
npm install
npm run dev
```

The exact visual design can evolve, but the route and module boundaries should remain connected to the master product flow.

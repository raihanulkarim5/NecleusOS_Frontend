# Personal OS — Frontend

React + TypeScript frontend for Personal OS, built module by module against
dummy data before the .NET Core API exists.

## Current module: Auth

Login and register screens, galaxy theme, backed by `mockAuthService`
(in-memory/localStorage session, no real backend yet). Swapping to the real
API later means writing `apiAuthService.ts` against the same `AuthService`
interface and changing one line in `src/services/index.ts` — no component
changes required.

## Getting started

```bash
npm install
npm run dev
```

## Structure

```
src/
  types/       → Auth, and future module types
  services/    → interface + mock/real implementations per module
  hooks/       → TanStack Query wrappers around services
  pages/       → screens (LoginPage, RegisterPage, ...)
  components/  → shared UI (StarfieldBackground, ...)
  styles/      → galaxy theme
```

## Build order

Auth → Layout shell → Dashboard → Entries → Tasks → Journal → Finance →
Projects → Inbox → Skills → Knowledge Base → Calendar.

# Project memory

## Product intent & audience

- 1:1 rebuild of the **Advanced PC&L Control Tower** application, using the original HTML file as the source of truth for visual design and functional behavior.
- Internal/team users authenticate with Microsoft work accounts via Entra ID before reaching the Control Tower.

## Brand personality & voice

- Production-grade, polished, "not cookie cutter" aesthetic (per `.bolt/prompt`).

## Visual design & UX direction

- Dark and light themes supported; sign-in screen matches current theme.
- Bilingual: Portuguese and English, switching with the rest of the app; translations centralized via a language helper.
- Header (top right): account button showing user initials; menu reveals name/email and "Sign out".
- Dev mode indicator: amber "Dev mode" badge replaces the account button when `VITE_DEV_MODE=true`.
- Icons from `lucide-react` (per `.bolt/prompt`).

## Decisions, constraints & rationale

- Framework: Vite + React + Tailwind + Lucide React; `@/` path alias for imports (per `.bolt/prompt`). No extra UI/icon packages.
- Entra auth configured with Tenant ID and Client ID sourced from `.env` (`VITE_TENANT_ID`, `VITE_CLIENT_ID`).
- Dev mode (`VITE_DEV_MODE=true`) skips Entra sign-in for local development; must not be enabled in real deployments.
- Dockerfile created (none existed before): accepts Tenant/Client IDs as `--build-arg`, falls back to `.env` values, fails the build if IDs are missing and dev mode is off.
- nginx config repeats security/server headers per `location` block because nginx drops server-level headers inside locations that set their own.
- Kept the existing React stack rather than migrating to the team-standard Vue + Bootstrap setup.

## Open questions & assumptions

- Redirect URIs for each runtime web address must be registered in the Entra admin portal under "Single-page application".
- Sign-in gates the UI but stored data does not yet verify the Microsoft login; team standard requires data-level auth as a next step.
- Team standard prefers Vue + Bootstrap; current build intentionally deviates (React/Tailwind retained) — confirm whether migration is eventually required.
- Real sign-in flow not browser-tested in this environment.
- Existing `.env` already contained Entra ID values before this work.
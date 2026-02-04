# Repository Guidelines

## Project Structure & Module Organization
- `src/` holds the TypeScript application. Key areas include `core/` (simulation engine), `entities/`, `systems/`, `rendering/`, `ui/`, and `utils/`.
- `src/config.ts` and `src/config/` define simulation parameters and defaults.
- `tests/` contains `unit/` and `integration/` suites (e.g., `tests/unit/.../*.test.ts`).
- `public/` is for static assets served by Vite; `assets/` stores repo images (logo, screenshots).
- `docs/` contains user and educational documentation; build output goes to `dist/`.

## Build, Test, and Development Commands
- `npm run dev` — start the Vite dev server for local development.
- `npm run build` — type-check (`tsc`) and build the production bundle.
- `npm run preview` — serve the production build locally.
- `npm run start` — run the Express server (`server.js`), honoring `PORT` (default 3000).
- `npm run lint` — run ESLint over `src/`.
- `npm run test`, `npm run test:watch`, `npm run test:coverage` — Vitest runs (CI, watch mode, coverage).

## Coding Style & Naming Conventions
- TypeScript (ES modules) with `strict` compiler settings. Keep changes type-safe and avoid unused locals/params.
- Indentation is 2 spaces; use semicolons and single quotes, matching existing files.
- Naming: `PascalCase` for classes/types, `camelCase` for variables/functions, `kebab-case` for docs paths, and `*.test.ts` for tests.

## Testing Guidelines
- Tests use Vitest. Place unit tests under `tests/unit/` and integration tests under `tests/integration/`.
- Name tests after the target module (e.g., `SpatialHash.test.ts`).
- Prefer adding coverage when modifying core simulation logic or UI behavior.

## Commit & Pull Request Guidelines
- Recent commits use conventional prefixes like `feat:` and `fix:`; follow the same pattern (imperative, short subject).
- PRs should include: a brief summary, testing notes (`npm run test` or a rationale if skipped), and screenshots/GIFs for UI changes.
- Link related issues when applicable and highlight any config changes (e.g., `src/config.ts`).

## Configuration & Environment Tips
- The local server reads `PORT`; no other environment variables are required.
- When adjusting simulation behavior, document the change in `docs/` or `Preylife.md` if it affects user-facing behavior.

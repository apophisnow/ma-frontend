**Overview**

This is the Music Assistant frontend — a Vue 3 + TypeScript PWA built with Vite and Vuetify. Use these notes to be productive quickly: how the app is structured, important patterns, where integrations live, and exact dev/test commands.

**Quick Commands**
- dev: `yarn dev` (starts Vite dev server)
- build: `yarn build` (runs `vue-tsc --noEmit` then `vite build`)
- preview: `yarn preview`
- lint: `yarn lint` (ESLint + --fix)
- tests: `yarn test` (UI: `yarn test:ui`, headless: `yarn test:run`, coverage: `yarn test:coverage`)

**Core Architecture & Files**
- Entry: `src/main.ts`, single-page app using Vue 3 + Composition API.
- UI: `src/components/` contains reusable Vue components and UI subfolders (dsp, navigation, profile, ui, users).
- State & plugins: `src/plugins/` holds platform integrations (see `sendspin-connection.ts`, `web_player.ts`, `api`), router, i18n, and Vuetify setup.
- Logic hooks: `src/composables/` contains composition functions and their tests (pattern: `*.test.ts` next to implementation).
- Helpers: `src/helpers/` for small utilities used across the app.
- Styles: `src/styles/` (SCSS vars in `_variables.scss`) and `public/` contains PWA assets like `sw.js`.
- Translations: `src/translations/*.json` (managed in Lokalise).

**Important Patterns & Conventions**
- Type checking uses `vue-tsc` (see `package.json` build script). Always run the type-check step when adding new TS/Vue types.
- Tests: `vitest` with JSDOM and `@vue/test-utils`. Unit tests co-locate with modules (`useButton.test.ts`, etc.). Use `yarn test:run` for CI-style runs.
- Composition API: prefer `src/composables` for reusable logic instead of mixing into components.
- Plugins: cross-cutting integrations belong in `src/plugins/`. Example: `src/plugins/sendspin-connection.ts` implements a WebSocket/WebRTC fallback and intercepts WebSocket constructor for `/sendspin` URLs — be careful when mocking websockets in tests.
- i18n: uses `vue-i18n` plus Lokalise. Translation keys live under `src/translations/`.

**Integration & External Services**
- Backend: frontend asks for the Music Assistant server URL on first run (defaults to port 8095). In dev, open dev server and point to a running MA backend.
- Sendspin/WebPlayer: `src/plugins/sendspin-connection.ts` (tries direct WebSocket, falls back to WebRTC via MA API signaling). `prepareSendspinSession()` and `installSendspinInterceptor()` are entrypoints.
- PWA: `vite-plugin-pwa` + `public/sw.js` — service worker and manifest are present.

**Developer Environment Notes**
- Use Node via `nvm use node` then `yarn install` (project uses Yarn v1 per `package.json`).
- Recommended editor: VSCode + Volar (disable Vetur). `README.md` documents Volar Take Over mode for better `.vue` type support.
- Husky is installed (`prepare` script); lint and hooks may run on commit.

**Testing & Debugging Tips**
- To run a quick headless suite: `yarn test:run`.
- For component debugging, run `yarn dev` and use Vue Devtools; Volar improves TypeScript in `.vue` files.
- When testing code that uses Sendspin, stub `prepareSendspinSession()` or mock `src/plugins/api` callbacks because the plugin intercepts `window.WebSocket` for `/sendspin` URLs.

**Where to Add New Code**
- New global features/integrations → `src/plugins/`.
- Reusable view logic → `src/composables/` with a paired test file.
- UI components → `src/components/` (follow existing folder structure and naming). Keep styles in `src/styles` or component-scoped styles.

**Files to Inspect for Context**
- [README.md](../README.md) — setup and dev notes
- `package.json` — scripts and deps
- `src/plugins/sendspin-connection.ts` — Sendspin WebSocket/WebRTC flow
- `src/plugins/web_player.ts` — multi-tab playback coordination
- `src/composables/` and `src/helpers/` — common patterns and tests

If anything here is unclear or you want more examples (e.g., a short cookbook for adding a plugin or writing a composable test), tell me which area and I'll expand the file.

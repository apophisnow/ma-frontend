**Frontend Integration Notes — Backend RBAC**

Purpose
- Add UI and client calls so admins can create, edit, list and delete roles, and assign arbitrary role strings to users. Frontend interactions use the existing WebSocket `sendCommand()` pattern.

DB / API summary (backend)
- New `roles` table: `roles(role_name TEXT PRIMARY KEY, description TEXT, permissions json, created_at TEXT)`.
- On first run default roles `admin` and `user` are inserted with permissions `["*"]`.
- Permissions are allow-only command patterns (strings). Matching: `*` (full access), trailing `*` for prefix matches, or exact strings.
- Endpoints still respect `required_role="admin"` decorators — RBAC permission patterns are an additional check.

User role behavior
- `users.role` is a string that may be `admin`, `user`, or any custom role name.
- User objects returned by the API expose `role` as a string (same as before). Admins may set arbitrary role strings on `auth/user/create` and `auth/user/update`.

WebSocket commands (admin-only)
- `auth/roles` → returns `[{ role_name, description, permissions:list, created_at }, ...]`
- `auth/role/create` Args: `{ role_name: string, description?: string, permissions?: string[] }` → returns `true|false`
- `auth/role/update` Args: `{ role_name: string, description?: string|null, permissions?: string[]|null }` → returns `true`
- `auth/role/delete` Args: `{ role_name: string }` → returns `true` (cannot delete built-in `admin`/`user`)
- These are called via the existing `sendCommand()` helper (same pattern as `auth/users`).

Quick JS examples
```
// list roles
const roles = await sendCommand('auth/roles')

// create role
await sendCommand('auth/role/create', {
  role_name: 'guest',
  description: 'Can add songs',
  permissions: ['music/*', 'player_queues/play_media']
})

// update role
await sendCommand('auth/role/update', {
  role_name: 'guest',
  description: 'Guest users that can add songs',
  permissions: ['music/*', 'player_queues/play_media']
})

// delete role
await sendCommand('auth/role/delete', { role_name: 'guest' })

// assign role to a user
await sendCommand('auth/user/update', { user_id: '<id>', role: 'guest' })
```

UI work to add
- **Roles list page**: new admin page showing `role_name`, `description`, `permissions[]`, `created_at`. Call `auth/roles` to populate.
- **Role create / edit form**: fields: `role_name` (text), `description` (text/optional), `permissions[]` (list)
  - Permissions input UX: allow selecting from known command groups (see below) or free-text patterns. Support adding exact commands and prefix patterns (trailing `*`). Show help text describing matching rules.
  - Prevent submitting a duplicate `role_name` (show server error if backend returns false on create).
  - On save, call `auth/role/create` or `auth/role/update`.
- **Role delete**: show confirmation modal; prevent deleting `admin` and `user` (disable delete button for those names and show tooltip explaining they are built-in).
- **User management**: in the existing user create/update UI add a `Role` select populated from `auth/roles` plus ensure `admin`/`user` are available even if backend hasn't returned them yet.
  - When updating a user role, call `auth/user/update` with `role` set to the chosen string.
  - Show current role string in user list and user details.
  - On hover or details view, show the role's `description` and `permissions[]`.

Permissions UX suggestions
- Provide two modes for entering permissions: pick-from-list and free-text.
  - Pick-from-list: call an existing command list API (if present) to group commands by area (e.g., `music/*`, `players/cmd/*`, `player_queues/*`). If a browse commands API doesn't exist, ship a curated list of common patterns in the UI.
  - Free-text: allow admins to type patterns like `players/cmd/volume_*` or `music/*`.
  - Validate common mistakes (e.g., warn when assigning `[*]` or `"*"` meaning full access). When a role contains `"*"` show a red warning: "This role grants full access to all commands.".

UX and safety
- Only users who are admins (backend-enforced) should see the Roles page and role controls — hide UI for non-admins.
- Confirm destructive actions (role delete). Disable deletion of `admin` and `user` roles client-side as well as rely on backend protection.
- When assigning roles, show current role string in the user row and show a tooltip or details that expands permissions.

Testing & verification
1. Login as an admin (the initial setup flow creates the first admin).
2. Call `auth/role/create` to add `viewer` and `guest` roles (examples below).
3. Assign `viewer` or `guest` role to a non-admin user using `auth/user/update`.
4. Using a WebSocket connection authenticated as the non-admin user, attempt to run commands that should be denied (e.g., `players/cmd/pause`) — backend must reject commands not permitted by the role's patterns.
5. Verify that `admin` users are unaffected (still have full access via default `"*"`), and that attempts to delete built-in roles are prevented.

Recommended example permission sets
- Viewer (read-only):
  - `['music/*', 'players/get', 'player_queues/items', 'player_queues/get', 'player_queues/get_active_queue']`
- Guest (add-only):
  - `['music/*', 'player_queues/play_media', 'player_queues/items', 'player_queues/get']`

Edge cases & implementation notes for frontend devs
- Role names are plain strings. Avoid special characters or spaces for simplicity — UI can validate that role names match `/^[A-Za-z0-9_\-]+$/` if desired.
- There is no deny list; to restrict behavior create a role that lists only the allowed commands.
- Backend still enforces `required_role='admin'` for admin-only endpoints — the frontend should not attempt admin-only operations unless the logged-in user is an admin.
- Role listing returns `permissions` as an array of strings; ensure the UI can add/remove/edit those strings.

Suggested integration points in this repo
- Add a new admin view under `src/views/` named `Roles.vue` and a composable `src/composables/useRoles.ts` that wraps calls to `sendCommand('auth/roles')`, `auth/role/create`, `auth/role/update`, and `auth/role/delete`.
- Populate the user role dropdown in the existing user management form (search for `auth/user` usage under `src/plugins/` and `src/components/` to find where to integrate).

Quick role creation examples (recommended test values)
```
await sendCommand('auth/role/create', {
  role_name: 'viewer',
  description: 'Read-only viewers',
  permissions: ['music/*','players/get','player_queues/items','player_queues/get']
})

await sendCommand('auth/role/create', {
  role_name: 'guest',
  description: 'Can add songs to queues',
  permissions: ['music/*','player_queues/play_media','player_queues/items']
})
```

Where to start
- Implement `useRoles.ts` composable and a `Roles.vue` admin view to list and manage roles.
- Add a role selector in the user edit form and wire it to `auth/user/update`.
- Add warnings and UI guards for `"*"` permissions and for built-in role deletion.

Change log
- Created to document frontend integration for backend RBAC support.

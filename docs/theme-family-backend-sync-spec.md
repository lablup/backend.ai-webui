# Theme-family preference: backend sync spec (proposal)

Status: proposal for the Backend.AI Manager team. The frontend (this repo) ships
the theme-family feature with **localStorage-only** persistence today; this
document specifies the server-side store needed to make the preference follow a
user **across devices**, and the small frontend change that consumes it.

## 1. Problem

The WebUI has **no server-side store for per-user UI preferences**. Verified
against the current client surface:

| Store | What it persists | Scope | Usable here? |
|---|---|---|---|
| `BackendAISettingsStore` (`react/src/global-stores.ts`) | `themeMode`, `themeFamily`, `custom_primary_color`, `custom_theme_config`, language, … | **localStorage only** | client-only, no sync |
| `Setting` / `Registry` → `/config/{get,set,delete}` | etcd keys (`config/docker/registry`, …) | global, **superadmin** | no (not per-user) |
| `UserConfig` → `/user-config/{dotfiles,bootstrap-script}` | shell dotfiles, bootstrap scripts | per-user, **mounted into compute sessions** | no (leaks a UI file into containers) |
| `modify_user` GraphQL mutation | `full_name`, `description`, `status`, `role`, … | fixed columns | no (no free-form prefs field) |

So cross-device theme sync requires a new Manager capability. This is out of the
frontend repo's reach and is intentionally deferred.

## 2. What needs to sync

A small, bounded per-user JSON blob of UI preferences. Initial keys:

```jsonc
{
  "themeFamily": "stained",   // family key from the catalog (resources/theme-families.json + theme.json `families` + "default")
  "customPrimaryColor": "#11aa22",  // optional #rrggbb primary-color override, or null
  "themeMode": "system"       // "system" | "light" | "dark"
}
```

The design should generalize to other UI prefs already in `localStorage`
(`compact_sidebar`, `selected_language`, board layouts, …) so we don't add a
column per setting. Treat it as an **opaque per-user preferences document**.

## 3. Frontend seam (already in place)

All theme-family state flows through a single hook, so wiring a backend store is
a localized change:

- `react/src/hooks/useThemeFamily.tsx` owns the family selection, persisted via
  `useLocalStorageGlobalState(THEME_FAMILY_STORAGE_KEY)`, and applies the
  `custom_primary_color` user setting (an ordinary `useBAISettingUserState`
  key, owned by `ThemeAccentColorPicker`).
- `react/src/hooks/useThemeMode.tsx` owns `themeMode`, same primitive.

To add sync, replace the `useLocalStorageGlobalState` read/write in these hooks
with a small `useUserPreference(key)` hook that (a) reads from the server-loaded
preferences document, (b) writes through to the new API (optimistic + debounced),
and (c) keeps localStorage as an offline cache + FOUC source (see §6). No UI, CSS,
or `theme.json` change is needed.

## 4. Proposed Manager API

Two viable shapes; **Option A recommended**.

### Option A (recommended): dedicated per-user preferences KV

A REST endpoint analogous to `UserConfig` but **not** mounted into sessions:

```
GET    /user-config/preferences            -> 200 { "preferences": { ... } }
POST   /user-config/preferences            body { "preferences": { ... } }  (merge or replace)
DELETE /user-config/preferences/{key}      -> 200
```

- Scope: the authenticated user (keypair/SSO identity); no admin needed.
- Storage: a single JSONB column on the user row (or a `user_preferences(user, doc)`
  table). Size-capped (e.g. 16 KiB) and schema-free.
- Auth: standard signed request, same as other `/user-config/*` routes.
- **Not** exposed to compute sessions (the key reason not to reuse dotfiles).

Pros: clean separation, generalizes to all UI prefs, no GraphQL schema churn,
mirrors the existing `UserConfig` client class so the WebUI client addition is
a ~20-line `UserConfig.getPreferences()/setPreferences()` pair.

### Option B: JSON column surfaced through `modify_user`

Add a `preferences: JSONString` field to the user type + `ModifyUserInput`.

```graphql
query { user(email: $email) { preferences } }
mutation { modify_user(email: $email, props: { preferences: $json }) { ok } }
```

Pros: rides existing user GraphQL. Cons: `modify_user` is admin-oriented (needs a
self-service path for ordinary users), JSON-in-string is awkward, couples UI prefs
to the user admin surface.

## 5. Frontend wiring (when the API lands)

1. Add `getPreferences()/setPreferences(patch)` to the `UserConfig` class in
   `src/lib/backend.ai-client-node.ts` (Option A).
2. Add `react/src/hooks/useUserPreference.ts` returning `[value, setValue]` with the
   same signature as today's `useLocalStorageGlobalState`, backed by the API +
   localStorage cache, gated by a capability check
   (`baiClient.supports('user-preferences')`).
3. Swap the two persistence calls in `useThemeFamily` / `useThemeMode` to
   `useUserPreference`. Everything downstream is unchanged.

Gate behind a feature flag / capability so older Managers keep working on
localStorage.

## 6. Migration & FOUC

- **First login with the new API**: if the server document is empty but
  localStorage has `themeFamily`/`customPrimaryColor`/`themeMode`, POST the local values
  once (migrate up), then treat the server as source of truth.
- **FOUC**: keep writing the resolved values to localStorage after each server
  read. The `index.html` bootstrap and `useThemeFamily`/`useThemeMode` still read
  localStorage for the pre-paint `data-theme-family` / `dark-theme` decision;
  the server is the cross-device source, localStorage is the fast local cache.
- **Offline / API failure**: fall back to the localStorage cache; never block
  render on the network.

## 7. Validation & security

- Re-validate on read: `themeFamily` must exist in the active family
  catalog (else fall back to `default`); `customPrimaryColor` must be a valid
  `#rrggbb` hex string before it reaches the Ant Design token system;
  `themeMode` ∈ {system,light,dark}.
- Server should treat the document as opaque but enforce a size cap and reject
  non-JSON.

## 8. Open questions for the Manager team

1. JSONB column on `users` vs a dedicated `user_preferences` table?
2. Self-service auth path for ordinary users (Option B would need one).
3. Capability string to advertise support (for `baiClient.supports(...)`).
4. Should this also become the home for the existing localStorage-only settings
   (`compact_sidebar`, `selected_language`, board layouts), i.e. one prefs doc
   for all of them?

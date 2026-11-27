# 0044 — App-level theme role from the route scope

## Summary

- The app has one app-level `<Theme>`, `AstryxBrandTheme` inside `DefaultProviders` (ADR 0043). `RouteScopedBrandTheme` in `DefaultProviders.tsx` passes it the [theme role](#glossary) `admin` on the `admin` [route scope](#glossary) and `brand` on the other scopes.
- `MainLayout` renders no theme provider around the whole [shell](#glossary), and `SystemAdminScopeTheme` no longer exists.
- `AstryxThemeStyleKeeper`, the first child of the app-level `<Theme>`, keeps the CSS of the brand and admin [runtime themes](#glossary) in the document while other theme providers change role or unmount.
- A region that needs another role or mode nests `AstryxAdminTheme` or `AstryxReverseTheme`.

> Unfamiliar terms are collected in the [Glossary](#glossary) at the end.

## Context

- **Two shell providers**: `AstryxBrandTheme` always passed the brand theme. Inside `MainLayout`, `SystemAdminScopeTheme` (#10552) wrapped the whole shell again and passed the brand theme, or the admin theme on the `admin` route scope. On the other scopes the two providers passed the same theme.
- **Separate family reads**: Each theme provider reads the selected [theme family](#glossary) through `useCustomThemeConfig()`. When the two providers held different families, the header took one family's color and the rest of the shell lost the theme's sizes (#11437).
- **Runtime theme CSS**: Astryx injects a runtime theme's CSS from the first `<Theme>` that uses the theme. That `<Theme>` removes the CSS when its `theme` prop changes or when it unmounts, even while other `<Theme>` elements use the same theme (`useThemeStyleInjection` in `@astryxdesign/core`, `theme/Theme.tsx`).
- **Rule scope**: Astryx scopes a theme's token and component rules from the theme's own `[data-astryx-theme="<name>"]` element down to the next `[data-astryx-theme]` element. A region whose theme has no CSS therefore gets no rules from the theme around it.
- **Role change**: An app-level `<Theme>` that changes role removes the brand theme's CSS when it was the first to inject that CSS. A reversed sider (`theme.siderMode`) still uses the brand theme, and Astryx then renders the sider with its base sizes.

## Diagram

```mermaid
flowchart TB
  dp["DefaultProviders"] -- "renders" --> rs["RouteScopedBrandTheme"]
  rs -- "role from useRouteScope" --> bt["AstryxBrandTheme: the app-level Theme"]
  bt -- "first child, injects the brand and admin CSS" --> kp["AstryxThemeStyleKeeper"]
  bt -- "children" --> ml["MainLayout: header, sider, page area"]
  bt -- "children" --> ov["NotificationHost and the components beside MainLayout"]
  ml -- "admin menu and admin page area" --> at["AstryxAdminTheme"]
  ml -- "sider when theme.siderMode reverses it" --> rt["AstryxReverseTheme"]
```

## Decision

### 1. `AstryxBrandTheme` takes the role as a prop

- **Role prop**: `AstryxBrandTheme` in `react/src/astryx-theme/AstryxBrandTheme.tsx` has the prop `role?: 'brand' | 'admin'`, which defaults to `brand`. It resolves its theme with `resolveRoleTheme(rawThemeConfig?.theme, role, activeThemeFamily)`.
- **No router read**: `AstryxBrandTheme` does not call a router hook, so a unit test renders it without a router.
- **Role source**: `RouteScopedBrandTheme` in `react/src/components/DefaultProviders.tsx` calls `useRouteScope()`. It passes `admin` when the scope is `admin`, and `brand` when the scope is `project` or `projectAdmin`.
- **Router subscription**: `RouteScopedBrandTheme` is a separate component with `'use memo'`. A URL change re-renders it, and does not re-render `DefaultProviders` or the providers that `DefaultProviders` renders.

### 2. No theme provider around the whole shell

- **`MainLayout`**: `MainLayout` renders `BAIAppShell` directly under the app-level `<Theme>`. A developer does not add a `<Theme>` that wraps the header, the sider and the page area together.
- **Scope change**: A change of route scope does not remount `BAIAppShell`, because the app-level `<Theme>` element stays mounted and only its `theme` prop changes.

### 3. `AstryxThemeStyleKeeper` owns the runtime theme CSS

- **Shape**: `AstryxThemeStyleKeeper` in `react/src/astryx-theme/AstryxThemeStyleKeeper.tsx` renders one empty `<Theme>` for each role in `KEPT_ROLES`, keyed by the theme's name. The wrapper element of `<Theme>` is `display: contents`, so an empty `<Theme>` draws nothing.
- **Kept roles**: `KEPT_ROLES` holds `brand` and `admin`, the roles that two theme providers can use at the same time. `KEPT_ROLES` leaves `secondary` out because one provider on `AstryxStylexProbePage` is its only user. A developer who adds a role that two providers share adds the role to `KEPT_ROLES`.
- **Position**: `AstryxBrandTheme` renders the keeper as the first child of its `<Theme>`. React runs the insertion effect of a child before its parent's, and of an earlier sibling before a later sibling's. The keeper's `<Theme>` elements therefore inject the CSS before any other theme provider in the same commit.
- **Lifetime**: A keeper `<Theme>` never receives another theme. When the family or the [appearance document](#glossary) changes, React unmounts the keeper's `<Theme>` and mounts one under the new name, in the commit in which every other theme provider changes.
- **Mode**: The keeper passes `mode="light"`. The mode of a nested `<Theme>` applies to its own wrapper element only, and the keeper's wrapper has no content.
- **Test**: `react/src/astryx-theme/themeStyleOwnership.test.tsx` asserts that every theme name on an element has an injected `<style>`. The test covers a role change, theme providers unmounting, and a family change.

### 4. Nested theme providers

| Provider | Where it wraps | Theme it passes |
|---|---|---|
| `AstryxAdminTheme` | the admin menu in `WebUISiderNavigation`; the page area in `MainLayout` on the `projectAdmin` scope; `AdminVFolderNodeListPage` | the admin theme, which differs from the app-level theme on `projectAdmin`; on `admin`, the admin menu and `AdminVFolderNodeListPage` pass the same theme as the app-level `<Theme>` |
| `AstryxReverseTheme` | the sider and the mobile navigation drawer, when `theme.siderMode` asks for the mode opposite the page's | the brand theme in the inverted mode |
| `AstryxBrandTheme`, `AstryxAdminTheme`, `AstryxSecondaryTheme` | the samples on `AstryxStylexProbePage`, a development page | the theme of each sample |

- **Family source**: Every theme provider reads the family from `useCustomThemeConfig()`. That hook keeps the value in one Jotai atom per storage key (`createGlobalStorageStateHook` in `react/src/hooks/useLocalStorageGlobalState.tsx`), so every provider reads the same family.

## Rejected alternatives

- **Two shell providers**: `SystemAdminScopeTheme` could stay, which leaves the app-level `<Theme>` on the brand theme so that it never removes the brand theme's CSS. This is rejected because the two providers resolve the same theme on the `project` and `projectAdmin` scopes.
- **Admin-only wrapper**: `MainLayout` could wrap the shell in `AstryxAdminTheme` only on the `admin` scope, which needs no role prop. This is rejected because React remounts the shell each time the wrapper appears or disappears (#10552).
- **Reference counting in Astryx**: Astryx could remove a theme's CSS only when the last `<Theme>` that uses the theme unmounts, which fixes the cause in the library. This is rejected because webui does not patch Astryx (ADR 0009).

## Consequences

- **Admin console overlays**: In the admin console, the components that `DefaultProviders` and `routes.tsx` render outside `MainLayout` take the admin theme: the notification stack, the folder explorer, the folder invitation modal and the file upload manager. Before this decision they took the brand theme.
- **Document-level values**: In the admin console, Astryx writes the admin theme's name on `<html>`, and `CSSTokenVariables` writes the admin accent to `--token-colorPrimary` on `:root`.
- **Signed-out admin URL**: A signed-out user who opens an `/admin` URL sees the login form under the admin theme.
- **Duplicate admin theme**: On the `admin` scope, the admin menu in `WebUISiderNavigation` and `AdminVFolderNodeListPage` nest an `AstryxAdminTheme` that passes the same theme as the app-level `<Theme>`. The admin menu needs its provider on the `projectAdmin` scope, where the app-level role is `brand`.
- **Persistent admin CSS**: The keeper keeps the admin theme's CSS in the document on pages that do not use the admin theme.
- **Keeper dependencies**: The keeper relies on React's order of insertion effects and on Astryx injecting from the first `<Theme>`. `themeStyleOwnership.test.tsx` fails when a sequence it covers leaves a theme without CSS.

## Sources

- GitHub issue #11437 and PR #11438, decided 2026-11-26. PR #11438 records the measurement of a reversed sider with and without the keeper.
- #10552, which added `SystemAdminScopeTheme`.
- Astryx 0.7.11: `useThemeStyleInjection` in `theme/Theme.tsx`, and `THEME_SCOPE_TO` in `theme/generateThemeRules.ts`.
- Related: ADR 0009 (Astryx through `@lablup/ui-common`, without patches), ADR 0043 (`DefaultProviders` mounted once by the root layout route).

## Glossary

| Term | Meaning |
|---|---|
| route scope | A route scope is the value that `useRouteScope()` returns for the current URL: `project`, `projectAdmin`, or `admin` for the system admin console under `/admin`. |
| theme role | A theme role is the `role` argument of `resolveRoleTheme`: `brand`, `admin` or `secondary`. The role selects which color of the appearance document becomes the theme's accent. |
| runtime theme | A runtime theme is a theme that `defineTheme()` builds in the browser and whose CSS Astryx injects into `<head>`. The default brand theme that `astryx theme build` prebuilds is not a runtime theme. |
| theme family | A theme family is a named set of colors under `theme.families` in the appearance document. Each user selects one family. |
| appearance document | The appearance document is the JSON that describes the theme and the branding: the domain's saved document, or `resources/theme.json` when the domain saved none. |
| shell | The shell is what `BAIAppShell` renders in `MainLayout`: the header, the sider and the page area. |

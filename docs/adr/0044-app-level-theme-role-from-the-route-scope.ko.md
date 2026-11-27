# 0044 — App-level theme role from the route scope

## Summary

- app에는 app-level `<Theme>`이 하나 있고, 그것은 `DefaultProviders` 안의 `AstryxBrandTheme`이다(ADR 0043). `DefaultProviders.tsx`의 `RouteScopedBrandTheme`은 `admin` [route scope](#용어)에서는 [theme role](#용어) `admin`을, 나머지 scope에서는 `brand`를 넘긴다.
- `MainLayout`은 [shell](#용어) 전체를 감싸는 theme provider를 render하지 않고, `SystemAdminScopeTheme`은 더 이상 없다.
- [appearance document](#용어)에는 `theme.siderMode`가 없고, `AstryxReverseTheme`은 더 이상 없다. sider는 page의 light 또는 dark mode를 따른다.
- brand인 app-level theme 아래에서 admin role이 필요한 영역은 `AstryxAdminTheme`을 중첩한다.

> 낯선 용어는 문서 맨 아래 [용어](#용어)에 모아 두었다.

## Context

- **Two shell providers**: `AstryxBrandTheme`은 항상 brand theme을 넘겼다. `MainLayout` 안에서는 `SystemAdminScopeTheme`(#10552)이 shell 전체를 다시 감싸고 brand theme을, `admin` route scope에서는 admin theme을 넘겼다. 나머지 scope에서는 두 provider가 같은 theme을 넘겼다.
- **Separate family reads**: theme provider는 각자 `useCustomThemeConfig()`로 선택된 [theme family](#용어)를 읽는다. 두 provider가 서로 다른 family를 들고 있을 때 header는 한 family의 색을 썼고 shell의 나머지는 theme의 크기를 잃었다(#11437).
- **Runtime theme CSS**: Astryx는 [runtime theme](#용어)의 CSS를 그 theme을 처음 쓰는 `<Theme>`에서 inject한다. 그 `<Theme>`은 자기 `theme` prop이 바뀌거나 자신이 unmount될 때, 다른 `<Theme>` element가 같은 theme을 쓰고 있어도 그 CSS를 제거한다(`@astryxdesign/core`의 `theme/Theme.tsx`에 있는 `useThemeStyleInjection`).
- **Rule scope**: Astryx는 theme의 token rule과 component rule을 그 theme 자신의 `[data-astryx-theme="<name>"]` element에서 다음 `[data-astryx-theme]` element까지로 scope한다. 그래서 자기 theme의 CSS가 없는 영역은 바깥 theme의 rule도 받지 못한다.
- **Sider mode override**: appearance document의 `theme.siderMode`는 sider를 light나 dark로 고정했다. 그 mode가 page의 mode와 다르면 `AstryxReverseTheme`이 모든 route scope에서 sider를 반대 mode의 brand theme으로 감쌌다.
- **Role change**: role을 바꾸는 app-level `<Theme>`은, 자신이 brand theme의 CSS를 처음 inject한 경우 그 CSS를 제거한다. `AstryxReverseTheme` 아래의 sider는 여전히 brand theme을 썼고, 그때 Astryx는 sider를 자기 기본 크기로 render했다.

## 설계도

```mermaid
flowchart TB
  dp["DefaultProviders"] -- "render한다" --> rs["RouteScopedBrandTheme"]
  rs -- "useRouteScope에서 얻은 role" --> bt["AstryxBrandTheme: app-level Theme"]
  bt -- "children" --> ml["MainLayout: header, sider, page area"]
  bt -- "children" --> ov["NotificationHost와 MainLayout 옆의 component"]
  ml -- "admin menu, 그리고 project admin page의 page area" --> at["AstryxAdminTheme"]
```

## Decision

### 1. `AstryxBrandTheme`은 role을 prop으로 받는다

- **Role prop**: `react/src/astryx-theme/AstryxBrandTheme.tsx`의 `AstryxBrandTheme`은 `role?: 'brand' | 'admin'` prop을 가지며 기본값은 `brand`다. `AstryxBrandTheme`은 `resolveRoleTheme(rawThemeConfig?.theme, role, activeThemeFamily)`로 자기 theme을 정한다.
- **No router read**: `AstryxBrandTheme`은 router hook을 호출하지 않으므로, unit test는 router 없이 그것을 render한다.
- **Role source**: `react/src/components/DefaultProviders.tsx`의 `RouteScopedBrandTheme`이 `useRouteScope()`를 호출한다. `RouteScopedBrandTheme`은 scope가 `admin`이면 `admin`을, scope가 `project`나 `projectAdmin`이면 `brand`를 넘긴다.
- **Router subscription**: `RouteScopedBrandTheme`은 `'use memo'`를 둔 별도 component다. URL이 바뀌면 React는 `RouteScopedBrandTheme`만 다시 render하고, `DefaultProviders`와 `DefaultProviders`가 render하는 provider는 다시 render하지 않는다.

### 2. shell 전체를 감싸는 theme provider는 없다

- **`MainLayout`**: `MainLayout`은 app-level `<Theme>` 바로 아래에 `BAIAppShell`을 render한다. 개발자는 header, sider, page area를 함께 감싸는 `<Theme>`을 추가하지 않는다.
- **Scope change**: route scope가 바뀌어도 `BAIAppShell`은 다시 mount되지 않는다. app-level `<Theme>` element가 mount된 채로 남고 그 `theme` prop만 바뀌기 때문이다.

### 3. appearance document에는 `theme.siderMode`가 없다

- **Document field**: `resources/theme.schema.json`과 `react/src/helper/customThemeConfig.ts`의 `BAIThemeConfig`는 `siderMode`를 선언하지 않는다. `react/src/helper/appearanceConfigV1.ts`의 v1 converter는 v1의 `sider.theme` 값을 버린다.
- **Sider mode**: `WebUISider`와 mobile navigation drawer는 자기 theme provider 없이 app-level `<Theme>` 아래에서 render되므로 page의 mode를 따른다. `AstryxReverseTheme`과 `useSiderThemeReversed`는 더 이상 없다.
- **Existing documents**: `pickValidAppearanceConfig`는 JSON schema를 실행하지 않으므로, `theme.siderMode`가 남아 있는 저장된 document도 load되고 app은 그 field를 무시한다. Branding page의 JSON editor는 schema로 검증하므로, 운영자가 그 field를 지울 때까지 error로 표시한다.

### 4. 중첩 theme provider

| Provider | 감싸는 곳 | 넘기는 theme |
|---|---|---|
| `AstryxAdminTheme` | `WebUISiderNavigation`의 admin menu; `projectAdmin` scope에서 `MainLayout`의 page area; `AdminVFolderNodeListPage` | admin theme. `projectAdmin`에서는 app-level theme과 다르다. `admin`에서는 admin menu와 `AdminVFolderNodeListPage`가 app-level `<Theme>`과 같은 theme을 넘긴다 |
| `AstryxBrandTheme`, `AstryxAdminTheme`, `AstryxSecondaryTheme` | 개발용 page인 `AstryxStylexProbePage`의 sample | 각 sample의 theme |

- **Brand theme on the admin scope**: `admin` scope에서는 어떤 provider도 brand theme을 중첩하지 않는다. app-level `<Theme>`이 admin role을 받을 때 brand theme의 CSS를 제거할 수 있으므로, 개발자는 그런 provider를 추가하지 않는다.
- **Family source**: 모든 theme provider는 `useCustomThemeConfig()`에서 family를 읽는다. 이 hook은 그 값을 storage key마다 하나인 Jotai atom에 둔다(`react/src/hooks/useLocalStorageGlobalState.tsx`의 `createGlobalStorageStateHook`). 그래서 모든 provider가 같은 family를 읽는다.

## 대안과 기각 사유

- **Two shell providers**: `SystemAdminScopeTheme`을 남겨 두면 app-level `<Theme>`이 brand theme에 머물러 brand theme의 CSS를 제거하지 않는다. `project`와 `projectAdmin` scope에서 두 provider가 같은 theme을 정하므로 기각한다.
- **Admin-only wrapper**: `MainLayout`이 `admin` scope에서만 shell을 `AstryxAdminTheme`으로 감싸면 role prop이 필요 없다. wrapper가 생기거나 사라질 때마다 React가 shell을 다시 mount하므로 기각한다(#10552).
- **A provider that owns the theme CSS**: component 하나가 role마다 빈 `<Theme>`을 app-level `<Theme>`의 첫 자식으로 render하면 두 theme의 CSS가 document에 남고 `theme.siderMode`를 유지할 수 있다. 팀이 없애기로 한 설정 하나를 위해 모든 page에 element 두 개와 admin theme의 CSS를 더하므로 기각한다.
- **Reference counting in Astryx**: Astryx가 theme을 쓰는 마지막 `<Theme>`이 unmount될 때만 그 theme의 CSS를 제거하면 원인을 library에서 고친다. webui는 Astryx를 patch하지 않으므로(ADR 0009) 기각한다.

## Consequences

- **Admin console overlays**: admin console에서는 `DefaultProviders`와 `routes.tsx`가 `MainLayout` 바깥에 render하는 component, 곧 notification stack, folder explorer, folder invitation modal, file upload manager가 admin theme을 받는다. 이 결정 전에는 이들이 brand theme을 받았다.
- **Document-level values**: admin console에서 Astryx는 `<html>`에 admin theme의 이름을 쓰고, `CSSTokenVariables`는 `:root`의 `--token-colorPrimary`에 admin accent를 쓴다.
- **Signed-out admin URL**: 로그아웃 상태의 사용자가 `/admin` URL을 열면 login form이 admin theme 아래에서 보인다.
- **Sider mode**: document에 `theme.siderMode`를 넣어 둔 배포에서는 sider가 page의 mode로 보인다.
- **Duplicate admin theme**: `admin` scope에서는 `WebUISiderNavigation`의 admin menu와 `AdminVFolderNodeListPage`가 app-level `<Theme>`과 같은 theme을 넘기는 `AstryxAdminTheme`을 중첩한다. admin menu는 app-level role이 `brand`인 `projectAdmin` scope에서 자기 provider가 필요하다.
- **CSS ownership**: admin theme의 CSS는 여전히 그것을 처음 inject하는 `<Theme>`, 곧 app-level `<Theme>`이나 중첩된 `AstryxAdminTheme` 중 하나에 속한다. console 전환, project admin page, 좁은 viewport를 거친 Playwright 실행에서 CSS 없는 theme은 없었다(PR #11438).

## 출처

- GitHub issue #11437과 PR #11438, 2026-11-27 결정. PR #11438에 측정 결과가 있다.
- `SystemAdminScopeTheme`을 추가한 #10552, v1의 `sider.theme`을 `theme.siderMode`로 옮긴 #9361.
- Astryx 0.7.11: `theme/Theme.tsx`의 `useThemeStyleInjection`, `theme/generateThemeRules.ts`의 `THEME_SCOPE_TO`.
- 관련: ADR 0009(`@lablup/ui-common`을 통한 Astryx, patch 없음), ADR 0043(root layout route가 한 번 mount하는 `DefaultProviders`).

## 용어

| 용어 | 뜻 |
|---|---|
| route scope | route scope는 `useRouteScope()`가 현재 URL에 대해 돌려주는 값으로, `project`, `projectAdmin`, 그리고 `/admin` 아래 system admin console인 `admin`이다. |
| theme role | theme role은 `resolveRoleTheme`의 `role` 인자로, `brand`, `admin`, `secondary` 중 하나다. role은 appearance document의 어느 색이 theme의 accent가 되는지를 고른다. |
| runtime theme | runtime theme은 `defineTheme()`이 브라우저에서 만들고 Astryx가 그 CSS를 `<head>`에 inject하는 theme이다. `astryx theme build`가 미리 만드는 기본 brand theme은 runtime theme이 아니다. |
| theme family | theme family는 appearance document의 `theme.families` 아래에 있는, 이름이 붙은 색 묶음이다. 사용자마다 family 하나를 고른다. |
| appearance document | appearance document는 theme과 branding을 기술하는 JSON으로, domain이 저장한 document이거나 domain이 저장한 것이 없을 때의 `resources/theme.json`이다. |
| shell | shell은 `MainLayout`에서 `BAIAppShell`이 render하는 것, 곧 header, sider, page area다. |

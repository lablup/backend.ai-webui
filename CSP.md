# Content-Security-Policy Policy

This document is the source of truth for the Backend.AI WebUI Content-Security-Policy.
It records the **strongest policy that is safe for the current codebase without patching
third-party libraries**, the recommended production and local-test header values, and the
per-directive rationale grounded in real source files. It was produced for PR #7802
(FR-3079), which completed CSP nonce coverage so that `script-src` can run
`'strict-dynamic'`.

## Why

CSP is the last line of defense against XSS: even if an attacker injects markup, a strict
policy prevents that markup from executing script or exfiltrating data. The goal of FR-3079
was to make **scripts nonce-strict** (so `script-src` no longer needs `'unsafe-inline'` or
`'unsafe-eval'`) while accepting one bounded, documented residual: `style-src` must keep
`'unsafe-inline'` because several bundled libraries inject un-nonced `<style>` elements and
inline `style=` attributes that cannot be threaded with a nonce today.

Getting the policy wrong fails in two opposite ways: too loose (no real XSS protection) or
too tight (the app silently breaks — Monaco editor, lazy routes, SSO login, syntax
highlighting, or app-proxy launch stop working with no obvious cause). Both failure modes
are subtle, so the exact policy and the reasons for every token are recorded here.

## Rules

1. **Scripts stay nonce-strict.** `script-src 'self' 'nonce-{{nonce}}' 'strict-dynamic'
   'wasm-unsafe-eval'`. Never add `'unsafe-inline'` or `'unsafe-eval'` to `script-src`
   (both are unnecessary and the former is ignored once a nonce is present).
2. **Never add a host source to `script-src` beyond `'self'`.** `'strict-dynamic'`
   propagates trust through the nonced entry; hosts are not needed and only widen the
   CSP2-fallback surface.
3. **Styles keep `'unsafe-inline'` and NO nonce.** Adding a nonce to `style-src` makes
   browsers ignore `'unsafe-inline'` and there is no `'strict-dynamic'` for styles — that
   would immediately block every un-nonced injector below.
4. **`connect-src`, `img-src`, `frame-src`, `font-src` must stay scoped to the deployment's
   OWN backend infrastructure** — never an external host, a scheme-only source (`https:`), or
   an apex/registrable-suffix wildcard. Backend.AI exposes services on **runtime-issued
   ports/hosts** (manager, storage-proxy download URLs, app-proxy, per-resource-group
   wsproxy), so enumerating each literal origin is impractical. Cover them with the
   **narrowest wildcard that fits the topology**: a **port wildcard** `scheme://HOST:*` when
   all services share one host on different ports, or a **single-level subdomain wildcard**
   `https://*.DOMAIN wss://*.DOMAIN` when services live on subdomains of one domain. These
   bounded wildcards are exactly what keeps `style-src 'unsafe-inline'` acceptable — a
   CSS-exfil attacker can still only reach *your own* infra, never an external collector.
5. **Always template both http(s) AND ws(s) variants** of the manager and app-proxy origins
   in `connect-src`. A host-only entry does not cover the websocket scheme.
6. **The policy MUST be delivered as an HTTP `Content-Security-Policy` header**, not a
   `<meta>` tag. `frame-ancestors`, `form-action`'s reporting, `report-to`/`report-uri`,
   and `sandbox` are all ignored under `<meta>` delivery. The `index.html` `<meta
   property="csp-nonce">` is the **nonce source only**, not the policy.
7. **Drop `upgrade-insecure-requests` for any http (non-TLS) backend.** Ship two variants
   (prod-https with it, http-backend without it).
8. **One nonce per request**, substituted identically into the `script-src` header and
   every `{{nonce}}` placeholder in `index.html`. A mismatch breaks every lazy-loaded route.

## Recommended production policy (HTTPS backend)

Single-line HTTP header value (substitute the `<...>` origins per deployment):

```
default-src 'self'; script-src 'self' 'nonce-{{nonce}}' 'strict-dynamic' 'wasm-unsafe-eval'; script-src-attr 'none'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: <BACKEND>; font-src 'self' data:; worker-src 'self' blob:; connect-src 'self' <BACKEND> <BACKEND_WS>; frame-src 'self' <APP_PROXY> https://webui.docs.backend.ai; frame-ancestors 'self'; base-uri 'self'; form-action 'self' <MANAGER_API>; object-src 'none'; manifest-src 'self'; upgrade-insecure-requests
```

`<BACKEND>` / `<BACKEND_WS>` is the **deployment-scoped wildcard (or enumerated list)** that
covers ALL of this deployment's backend services — manager API, storage-proxy download/upload
endpoints, and the app-proxy — in http(s) and ws(s) form respectively. The web server composes
it from its known topology (see Rule 4 for the two shapes). Concretely:

- **Single backend host, many ports** (manager `:8090`, storage-proxy `:6021`, …) →
  `<BACKEND>` = `https://HOST:*` (or `http://HOST:*`), `<BACKEND_WS>` = `wss://HOST:*`. The
  `:*` port wildcard is what lets a storage-proxy download on a different port through without
  enumerating it, while still pinning to that one host.
- **Services on subdomains of one domain** → `<BACKEND>` = `https://*.DOMAIN`,
  `<BACKEND_WS>` = `wss://*.DOMAIN`. Single-level only (`*.DOMAIN` matches `a.DOMAIN`, not
  `a.b.DOMAIN`); for a deeper tree wildcard the specific parent (`*.app.DOMAIN`).
- `<MANAGER_API>` in `form-action` — the manager origin (http(s)), where SAML/OpenID SSO POSTs
  the login form. It is **user-entered at login** (`config.toml` `apiEndpoint` is commented
  out), so the web server substitutes it (or uses the same host-scoped wildcard).
- `<APP_PROXY>` in `frame-src` — the app-proxy origin, only if any app launches into an
  **iframe**; apps launched via `window.open` do not need it. Per-resource-group deployments
  issue dynamic `wsproxy_addr` hosts (`useBackendAIAppLauncher.tsx`), so prefer the subdomain
  wildcard over enumerating each.

Storage-proxy URLs and per-RG wsproxy addresses are **returned by the manager at runtime**
(e.g. `VFolderTextFileEditorModal.tsx` downloads from `http://HOST:6021/download?token=…`), so
they cannot be statically listed — the host wildcard is the realistic way to admit them.

## Recommended local-test policy (http backend)

For serving a local production bundle against the test backend (all services on host
`10.122.10.215` — manager `:8090`, storage-proxy `:6021`, … — plus app-proxy
`apphub.v7.backend.ai`) via `serve` with a `serve.json` `headers` entry. Uses a **fixed
nonce** `csptest123` (the bundle's `{{nonce}}` placeholders must be replaced with the same
literal) and **omits `upgrade-insecure-requests`** so the http backend is not silently
upgraded to https. The backend host uses a **`:*` port wildcard** so storage-proxy downloads
(`:6021`) and any other service port on that host pass without enumeration:

```
default-src 'self'; script-src 'self' 'nonce-csptest123' 'strict-dynamic' 'wasm-unsafe-eval'; script-src-attr 'none'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: http://10.122.10.215:* https://apphub.v7.backend.ai; font-src 'self' data:; worker-src 'self' blob:; connect-src 'self' http://10.122.10.215:* ws://10.122.10.215:* https://apphub.v7.backend.ai wss://apphub.v7.backend.ai https://*.apphub.v7.backend.ai wss://*.apphub.v7.backend.ai; frame-src 'self' http://10.122.10.215:* https://apphub.v7.backend.ai https://*.apphub.v7.backend.ai https://webui.docs.backend.ai; frame-ancestors 'self'; base-uri 'self'; form-action 'self' http://10.122.10.215:*; object-src 'none'; manifest-src 'self'
```

Note: `serve.json` `headers` deliver the policy as a real HTTP header (so `frame-ancestors`
is honored), which is exactly the prod delivery channel — making this a faithful smoke test.

## Per-directive rationale

### `script-src 'self' 'nonce-{{nonce}}' 'strict-dynamic' 'wasm-unsafe-eval'` + `script-src-attr 'none'`

- **`'nonce-{{nonce}}'`** authorizes the 5 nonced `<script>` tags in `index.html`
  (`index.html:25,41,60,124` plus the splash/bootstrap) and the Vite-injected entry module.
- **`'strict-dynamic'` is REQUIRED, not optional.** Monaco is the key dependency: its
  `@monaco-editor/loader` does `document.createElement('script')` for
  `/resources/monaco/vs/loader.js` with **no nonce**, and Monaco's own loader injects
  further un-nonced scripts (`loadMonacoEditor` in `react/src/helper/monacoEditor.ts` does
  not pass `cspNonce`). Those only execute via nonce-propagated trust. `'strict-dynamic'`
  also covers Vite code-split chunks, `React.lazy` imports (`react/src/routes.tsx`), and the
  runtime plugin `import()` in `react/src/components/PluginLoader.tsx` and
  `react/src/components/LoginView.tsx`. A nonce-only policy (no `strict-dynamic`) would
  break the code editor.
- **`'self'`** is the CSP2/old-browser fallback (CSP3 browsers ignore it once
  `strict-dynamic` is present). It is a real, low-severity residual surface: a CSP2 browser
  honors `'self'` and would run any same-origin JS — most relevantly `/dist/plugins/*.js`.
  **Deployment invariant:** the app origin must never serve attacker-writable content with a
  JS content-type (esp. `/dist/plugins/`). The in-app diagnostic
  (`react/src/diagnostics/rules/cspRules.ts:207-215`) is satisfied by the nonce alone, so
  `'self'` is kept purely for the old-browser fallback — drop it only if CSP2 support is
  officially abandoned.
- **`'wasm-unsafe-eval'`** is the narrow WASM-compile token shiki's oniguruma engine needs
  (`react/src/hooks/useHighlight.ts`). It is NOT `'unsafe-eval'`: grep over `react/src`,
  `packages/backend.ai-ui/src`, and `src` finds no `eval(`, `new Function(`,
  `importScripts(`, or string-argument timers, so classic eval-XSS is not enabled.
- **`script-src-attr 'none'`** blocks inline `on*=` handler attributes (none exist in
  source). `.onload`/`.onerror`/`.onclick` property assignments are not governed by it, and
  the `dangerouslySetInnerHTML` sinks (Chat `SyntaxHighlighter.tsx`, `LoginFormPanel.tsx`,
  `TermsOfServiceModal.tsx`, `PrivacyPolicyModal.tsx`) are DOMPurify-sanitized.

### `style-src 'self' 'unsafe-inline'` (no nonce, no `style-src-attr`)

`'unsafe-inline'` is unavoidable without patching libraries. The app **does** correctly
nonce every style path it can control (these prove `'unsafe-inline'` is not laziness):

- `react/src/components/DefaultProviders.tsx` — `ConfigProvider csp={{ nonce:
  globalThis.baiNonce }}` (antd cssinjs).
- `react/src/index.tsx` — `ConfigProvider.config` `holderRender` wraps the detached
  static-method (`message`/`notification`/`Modal`) holder in `ConfigProvider csp={{ nonce }}`.
- `packages/backend.ai-ui/src/components/BAIModal.tsx` — the scroll-unlock
  `createElement('style')` sets `style.nonce = globalThis.baiNonce`.
- `index.html:30` splash `<style nonce="{{nonce}}">`.

to-astryx ticket 33 removed two entries that used to sit in this list: the
`@emotion/react` `<CacheProvider>` (nonce for `createGlobalStyle`) and antd-style's
`<StyleProvider nonce>` (nonce for `createStyles`). With the last `antd-style` call site
gone, neither engine injects `<style>` on our behalf any more — the replacement rules ship
as bundled same-origin stylesheets, which plain `style-src 'self'` already covers, and the
`@emotion/*` dependencies were dropped from `react/package.json`. Values that must vary at
runtime are written as CSS custom properties through the CSSOM
(`element.style.setProperty`), which CSP does not intercept.

Despite that, the following **un-nonced** injectors remain and FORCE `'unsafe-inline'`:

1. **`@melloware/react-logviewer`** bundles the Rollup `style-inject` helper, which does
   `document.createElement('style')` and never sets a nonce (no `ref.nonce` path); it runs
   at module-eval time. Imported by
   `react/src/components/ComputeSessionNodeItems/ContainerLogModal.tsx` (`LazyLog`,
   `ScrollFollow`).
2. **antd's `@rc-component/util` `getScrollBarSize.js`** calls `updateCSS(css, randomId)`
   with a string key (not an options object), so `option.csp.nonce` is `undefined` and the
   measurement `<style>` is emitted without a nonce. Triggered by Modal/Drawer scroll-lock.
3. ~~**The `@emotion/css` singleton cache**~~ — GONE. It seeded antd-style's default
   `CacheManager` fallback cache and backed `react-layout-kit` (`BAIFlex`'s `FlexBasic`);
   to-astryx retired both (`react-layout-kit` with the lobehub removal in ticket 30,
   `antd-style` in ticket 33), so no `<style data-emotion="css">` is emitted any more.

Additionally, since the policy has **no separate `style-src-attr`**, browsers apply
`style-src` to inline `style=` attributes too. `'unsafe-inline'` is what permits React
`style={{}}`, recharts SVG inline styles, shiki single-theme token styles (rendered via
`dangerouslySetInnerHTML`), and react-virtuoso's inline layout styles. A `style-src-attr`
directive is deliberately omitted (adding `'none'` would break all of these).

**Bounded residual risk:** a malicious un-nonced `<style>`/`style=` slipping past the
DOMPurify sinks could attempt CSS-based exfil (attribute selectors + `background: url()`) or
clickjacking overlays. This is contained because (a) `script-src` stays nonce+strict-dynamic
(no JS injection), (b) `img-src`/`connect-src`/`font-src` are origin-restricted with no
external host (no remote CSS-exfil sink), and (c) `frame-ancestors 'self'` blocks framing.
**Invariant:** never add an external host to `img-src`/`font-src`/`connect-src` without
re-evaluating CSS exfil.

### `img-src 'self' data: blob: <BACKEND>`

`data:` = `react/src/components/BrandingSettingItems/LogoPreviewer.tsx:120` 1x1 placeholder
+ antd `<Image>` fallback. `blob:` = Chat attachment previews
(`react/src/components/Chat/ChatCard.tsx:368` `URL.createObjectURL` →
`ChatMessage.tsx` `<Image src={blobUrl}>`). `<BACKEND>` is the same deployment-scoped backend
wildcard as `connect-src` (Rule 4): the storage-proxy serves vfolder thumbnails / images by
URL on its own host:port, so `img-src` must admit that host too. Do **not** add any host
beyond your own backend infra — an external image host would become a CSS-exfil sink under
`'unsafe-inline'` styles.

### `font-src 'self' data:`

Self-hosted Roboto + Ubuntu woff/woff2 (`resources/fonts/*`, linked at `index.html:21-22`),
all same-origin → `'self'`. `data:` is not currently used but is a zero-cost margin against a
future antd/icon-font upgrade inlining a base64 woff; data: fonts are not an XSS vector.

### `worker-src 'self' blob:`

`'self'` = same-origin `/sw.js` (VitePWA `generateSW`, registered `index.html:176`).
`blob:` = Monaco's AMD-loader worker bootstrap wraps the worker entry in a Blob and
instantiates via a `blob:` URL (used by `BAICodeEditor`, `VFolderTextFileEditorModal`,
`ThemeJsonConfigModal`). No app-authored `new Worker`/`SharedWorker` exists.

### `connect-src 'self' <BACKEND> <BACKEND_WS>`

The primary exfil boundary, and the directive most exposed to Backend.AI's dynamic topology.
It must cover **every** backend service the app talks to, which is more than just the manager:

- **Manager API** — user-entered origin (`src/lib/backend.ai-client-node.ts`,
  `RelayEnvironment.ts` `/admin/gql`).
- **Storage-proxy** — vfolder download/upload. The manager returns a download URL on the
  storage-proxy's **own host:port** at runtime, e.g.
  `VFolderTextFileEditorModal.tsx:141` fetches `http://HOST:6021/download?token=…` — a
  *different port* from the manager's `:8090`, which a manager-only `connect-src` blocks.
- **App-proxy / per-RG wsproxy** — `config.toml [wsproxy] proxyURL` plus manager-issued
  dynamic `wsproxy_addr` hosts (`react/src/hooks/useBackendAIAppLauncher.tsx:251`).

**ws(s) variants are mandatory** — `RelayEnvironment.ts:119` graphql-sse subscriptions,
`helper/index.tsx:900` `fetchEventSource`, and `backend.ai-client-node.ts:3729` `EventSource`
use the ws(s) scheme, and `matchesCspSource` compares protocol exactly (an `https://` source
does NOT cover `wss://`).

Because storage-proxy ports and per-RG wsproxy hosts are runtime-issued, enumerating each is
impractical — use the **deployment-scoped wildcard** from Rule 4: `scheme://HOST:*` for a
single-host backend (the `:*` admits `:6021`, `:8090`, … on that one host) or
`https://*.DOMAIN wss://*.DOMAIN` for a subdomain topology. **Never widen to a scheme-only
(`https:`), apex, or registrable-suffix wildcard** — that would gut the exfil boundary that
makes `style-src 'unsafe-inline'` acceptable. No Sentry/analytics/CDN/external font origins
are needed (grep returns zero).

### `frame-src 'self' https://webui.docs.backend.ai`

The always-present embedded iframe is the help drawer
(`react/src/components/.../BAIHelpDrawer.tsx`, `WEBUIHelpButton.tsx` →
`https://webui.docs.backend.ai`). Apps generally launch via `window.open`
(`EduAppLauncher.tsx:257`), which `frame-src` does not govern — but some deployments/app
modes render the app-proxy **inside an iframe**, so add `<APP_PROXY>` (the same
deployment-scoped wildcard) when in-page apps are used; the local-test policy includes it
defensively. (`checkCspFrameSrc` in `cspRules.ts:273` checks the manager endpoint against
`frame-src` and may warn spuriously — do NOT add the *manager* origin just to satisfy it;
that would widen the clickjacking surface.) If FastTrack/pipeline is enabled, add
`<PIPELINE_FRONTEND>` (`config.toml [pipeline] frontendEndpoint`).

### `frame-ancestors 'self'`

Anti-clickjacking for the login / 2FA flow (`enable2FA`, `force2FA`). `'self'` (not `'none'`)
permits same-origin embeds (e.g. a plugin page). **Honored only under HTTP-header delivery** —
ignored if the policy is ever delivered via `<meta>`. No in-app diagnostic exists, so its
presence must be verified manually on the served response.

### `base-uri 'self'`, `object-src 'none'` (mandatory `strict-dynamic` companions)

`base-uri 'self'` closes the canonical `strict-dynamic` bypass: an injected
`<base href="//evil">` would repoint Vite's relative chunk/modulepreload URLs (trusted via
the nonced entry) and Monaco's loader path onto an attacker origin. `index.html:15` ships a
static `<base href="/">` and no code injects a `<base>` at runtime. `object-src 'none'`
blocks `<object>/<embed>` plugin script execution (none used in source).

### `form-action 'self' <MANAGER_API>`

`form-action` has **no `default-src` fallback** — omitting it leaves form POSTs unrestricted
(a credential-exfil hole). `<MANAGER_API>` is required because SAML and OpenID SSO build a
real `<form method="POST">` and call `form.submit()` to the (cross-origin, user-entered)
manager endpoint (`src/lib/loginSessionAuth.ts:361-390`,
`backend.ai-client-node.ts:1346`). `'self'` alone would break SSO — verify a SAML/OpenID
login during rollout.

### `manifest-src 'self'`

Same-origin PWA `manifest.json` (`index.html:20`).

### `upgrade-insecure-requests` (PROD only)

Upgrades http→https / ws→wss before the request leaves the browser. **Must be dropped from
the http-backend test variant** — it would silently upgrade `http://10.122.10.215:8090` to
`https://` and fail with connection-refused and no CSP console error.

## How scripts became nonce-strict (`strict-dynamic`)

Three coordinated mechanisms make every JS entry point either nonced or trusted via
propagation:

1. **`index.html` nonce placeholders.** All 5 `<script>` tags carry `nonce="{{nonce}}"`
   (`index.html:25,41,60,124`), plus `<meta property="csp-nonce" nonce="{{nonce}}">`
   (`index.html:14`) as the runtime nonce source for Vite's `__vitePreload` helper, and
   `globalThis.baiNonce = "{{nonce}}"` (`index.html:50`) as the mirror that all runtime
   injectors read. The web server substitutes `{{nonce}}` per request (empty in dev).
2. **The Vite `csp-nonce` meta → modulepreload.** Vite's preload helper reads
   `document.querySelector("meta[property=csp-nonce]")` at runtime and stamps that nonce on
   the `<link rel="modulepreload">` (and `<link rel="stylesheet">`) tags it injects for
   code-split chunks. Without the meta tag, every lazy route's modulepreload would be
   blocked under `strict-dynamic`.
3. **`react/vite.config.ts` re-stamps the entry module nonce.** Vite's build DROPS the
   custom `nonce` attribute when it rewrites the entry `<script type="module">` src to the
   hashed chunk URL. `cspBundleNoncePlugin` (`react/vite.config.ts:355-368`,
   `apply: 'build'`, `transformIndexHtml` `order: 'post'`) runs after that rewrite and
   re-adds `nonce="{{nonce}}"` to every module script lacking one (negative lookahead
   prevents double-stamping). The dev path strips `{{nonce}}` (no server-side CSP in dev).
   Vite's built-in `injectNonceAttributeTagHook` is left dormant (`config.html.cspNonce`
   unset) — setting it would bake one static build-time nonce, defeating per-request
   substitution.

With all three in place, `'strict-dynamic'` propagates trust from the nonced entry through
the entire module graph (Vite chunks, `React.lazy`, runtime plugin `import()`, Monaco's
loader-injected scripts), and `script-src` needs no `'unsafe-inline'`.

## Why styles stay `'unsafe-inline'` — injector inventory

| Source | Mechanism | Nonce hook? |
|---|---|---|
| `@melloware/react-logviewer` (via `ContainerLogModal.tsx`) | bundled Rollup `style-inject` → `createElement('style')` at module eval | No `ref.nonce` path |
| antd `@rc-component/util` `getScrollBarSize.js` | `updateCSS(css, randomId)` — string key, not options, so `option.csp.nonce` undefined | No (string-key call path) |
| Inline `style=` attributes (React `style={{}}`, recharts SVG, shiki tokens, react-virtuoso) | set on elements / `dangerouslySetInnerHTML` | N/A — governed by `style-src` since no `style-src-attr` |

Going nonce-strict on styles would require forking the logviewer `styleInject` and patching
`getScrollBarSize` to thread `option.csp` — neither exposes a runtime hook today. Out of
scope for a no-library-patch CSP. (The third blocker, the `@emotion/css` singleton, is gone
with antd-style; see above.)

## Testing: build + serve locally

1. Build a production bundle: `pnpm run build` (output in `build/web/`).
2. Substitute the fixed test nonce into the served document — replace all `{{nonce}}`
   placeholders in `build/web/index.html` with `csptest123` (the same literal used in the
   test header below).
3. Add a `serve.json` next to the bundle delivering the **test** CSP as a real HTTP header
   (so `frame-ancestors` is exercised), e.g.:

   ```json
   {
     "headers": [
       {
         "source": "**",
         "headers": [
           {
             "key": "Content-Security-Policy",
             "value": "default-src 'self'; script-src 'self' 'nonce-csptest123' 'strict-dynamic' 'wasm-unsafe-eval'; script-src-attr 'none'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: http://10.122.10.215:* https://apphub.v7.backend.ai; font-src 'self' data:; worker-src 'self' blob:; connect-src 'self' http://10.122.10.215:* ws://10.122.10.215:* https://apphub.v7.backend.ai wss://apphub.v7.backend.ai https://*.apphub.v7.backend.ai wss://*.apphub.v7.backend.ai; frame-src 'self' http://10.122.10.215:* https://apphub.v7.backend.ai https://*.apphub.v7.backend.ai https://webui.docs.backend.ai; frame-ancestors 'self'; base-uri 'self'; form-action 'self' http://10.122.10.215:*; object-src 'none'; manifest-src 'self'"
           }
         ]
       }
     ]
   }
   ```

4. Serve it and exercise the **smoke checks** that catch every CSP regression:
   - App boots with **no CSP violation** in the console (entry + chunks load).
   - Navigate to a **lazy route** (confirms modulepreload nonce parity — the meta nonce must
     equal the header nonce).
   - Open a **Monaco editor** (code/theme/file editor) — confirms `strict-dynamic` (loader
     scripts) + `worker-src blob:`.
   - Render **syntax-highlighted code** (Chat / source view) — confirms `'wasm-unsafe-eval'`.
   - Open the **container log modal** and a **modal/drawer** — confirms the un-nonced style
     injectors are allowed by `'unsafe-inline'`.
   - Launch an **app via window.open** and confirm app-proxy connectivity — confirms
     `connect-src` ws(s) origins.
   - If SSO is configured, run a **SAML/OpenID login** — confirms `form-action <MANAGER_API>`.
   - Open the in-app **CSP Diagnostics** section (`CspDiagnosticsSection`) — confirms no
     self-reported `csp-*` blocks.

## Future hardening

- **Trusted Types** (`require-trusted-types-for 'script'`) is the strongest DOM-XSS defense
  but is infeasible without a multi-file refactor: live `dangerouslySetInnerHTML` sinks
  (Chat `SyntaxHighlighter`, `LoginFormPanel`, Terms/Privacy modals) pass DOMPurify strings,
  not `TrustedHTML`, and Monaco/Vite inject script URLs without a policy. Adopting it means
  registering a default policy and threading DOMPurify output through `policy.createHTML`.
  Track as a separate epic. (Note: `src/lib/webcomponents-loader.js` uses
  `trustedTypes.createPolicy`, but it is the legacy Polymer/Electron path and is not imported
  by the React app — it provides no coverage.)
- **Drop `style-src 'unsafe-inline'`** only after patching/forking the two injectors above
  to accept a nonce (logviewer `styleInject`, `getScrollBarSize` `option.csp`) AND splitting
  `style-src-attr` to handle inline `style=` attributes.
  No security gain is realized until ALL injectors are nonced.
- **Add `report-to` (with a `Reporting-Endpoints` header) and `report-uri`**, rolled out
  first as `Content-Security-Policy-Report-Only` for one release cycle. This is how a new
  library injecting un-nonced script gets detected before it reaches users. Requires
  HTTP-header delivery.
- **Drop `'self'` from `script-src`** if/when CSP2 browser support is officially abandoned
  (CSP3 ignores it under `strict-dynamic` anyway; its only live effect is the CSP2 host
  fallback).
- **Revisit `cspBundleNoncePlugin`** if `@vitejs/plugin-legacy` is ever added — it emits
  `nomodule`/SystemJS scripts the current `type="module"` regex would not cover.

## Related

- `index.html` — nonce placeholders on all scripts, `<meta property="csp-nonce">`,
  `globalThis.baiNonce`, splash `<style nonce>`, `<base href="/">`.
- `react/vite.config.ts:355-368` — `cspBundleNoncePlugin` re-stamps the entry module nonce.
- `react/src/components/DefaultProviders.tsx:83-86,298,366-367` — `emotionGlobalCache`,
  `ConfigProvider csp`, `CacheProvider`, `StyleProvider nonce`.
- `react/src/index.tsx` — `ConfigProvider.config` `holderRender` nonce for static holders.
- `packages/backend.ai-ui/src/components/BAIModal.tsx` — scroll-unlock `<style>` nonce.
- `react/src/components/ComputeSessionNodeItems/ContainerLogModal.tsx` — the
  `@melloware/react-logviewer` consumer (un-nonced style injector).
- `react/src/helper/monacoEditor.ts` — Monaco loader (un-nonced injected scripts →
  `strict-dynamic` dependency).
- `react/src/hooks/useHighlight.ts` — shiki/oniguruma WASM (`'wasm-unsafe-eval'` dependency).
- `react/src/diagnostics/rules/cspRules.ts` — in-app CSP self-diagnostics.
- `config.toml` — `apiEndpoint` (commented, dynamic), `[wsproxy] proxyURL`, `[pipeline]
  frontendEndpoint`.
- FR-3079 / PR #7802 — the change that completed CSP nonce coverage.
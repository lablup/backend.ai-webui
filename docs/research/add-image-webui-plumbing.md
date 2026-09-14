# WebUI plumbing facts for the Add-image modal

Research note for **FR-3935 / #9669**, a child of the map **FR-3933 / #9667**
("Add image from NGC catalog URL / canonical via single-image rescan").

Scope: the WebUI-side facts the "Add image" modal depends on, so the prototype
(#9670) and the spec do not guess. Every claim carries a `path:line` pointer.
WebUI paths are relative to this repository; manager paths are relative to a
`lablup/backend.ai` checkout (read read-only at `~/Workspace/backend.ai`,
`main`, 2026-09-14).

Read the map's Notes section first — the established facts (NGC URL grammar,
browser CORS, the `(registry_name, project)` matching rule, the prerequisite
core fix) are not re-derived here.

**Three findings contradict or sharpen the map's Notes; they are flagged
inline and collected in §7.**

---

## 0. The endpoint, as the manager defines it today

| Fact | Where |
|---|---|
| Route `POST /admin/images/rescan`, middlewares `[auth_required, superadmin_required]` | `src/ai/backend/manager/api/rest/image/registry.py:20`, `:24` |
| Sub-registry named `images`, a child of `admin` | `src/ai/backend/manager/api/rest/image/registry.py:17-18` |
| Request body `RescanImagesRequest { canonical: str, architecture: str }` — both **required**, no defaults | `src/ai/backend/common/dto/manager/image/request.py:61-65` |
| Response `RescanImagesResponse { item: ImageDTO, errors: list[str] }` | `src/ai/backend/common/dto/manager/image/response.py:89-93` |
| `ImageDTO` fields | `src/ai/backend/common/dto/manager/image/response.py:52-73` |
| Handler is **synchronous** — `wait_for_complete`, HTTP 200 carrying the DTO; no bgtask id (unlike the GraphQL `rescan_images` mutation) | `src/ai/backend/manager/api/rest/image/handler.py:88-101` |

**The map's premise is confirmed and still holds on current `main`.** The call
chain is `handler.rescan` → `ScanImageAction`
(`src/ai/backend/manager/api/rest/image/handler.py:94-96`) →
`ImageService.scan_image`
(`src/ai/backend/manager/services/image/service.py:381-388`) →
`ImageRepository.scan_image_by_identifier`
(`src/ai/backend/manager/repositories/image/repository.py:262-268`) →
`db_source.scan_and_upsert_image`
(`src/ai/backend/manager/repositories/image/db_source/db_source.py:284-310`),
whose **first** statement resolves the image out of the DB
(`_resolve_image(session, [ImageIdentifier(canonical, architecture)])`,
`db_source.py:293-295`). An image not already registered raises `ImageNotFound`
before any registry is contacted. Making this endpoint register a DB-absent
image is the prerequisite core change, tracked outside this map.

Two further shapes the modal must plan for, both visible in current code:

- **`errors` is always empty on the happy path.** The scanner returns
  `RescanImagesResult(images=scanned_images)` with no `errors` argument
  (`src/ai/backend/manager/container_registry/base.py:291`), and
  `RescanImagesResponse.errors` defaults to `[]`
  (`response.py:93`). So `errors` is **not** a per-line failure channel today;
  failures arrive as thrown HTTP errors. The modal must classify on the thrown
  error and treat a non-empty `errors` as a bonus, not the primary signal.
- **A missing manifest is swallowed, then crashes on indexing.** `_scan_tag`
  returns silently on a registry `404`
  (`src/ai/backend/manager/container_registry/base.py:363-366`), so
  `commit_rescan_result` yields an empty list
  (`base.py:177-181`) and `ScanImageActionResult(image=result.images[0], …)`
  (`src/ai/backend/manager/services/image/service.py:388`) raises `IndexError`
  → HTTP 500 with no useful body. **"Tag/manifest not found" is therefore not a
  clean 404 today.** Worth raising against the prerequisite ticket; until then
  the modal must degrade gracefully rather than assume a tidy status code.

---

## 1. REST call path, and where `scanImage({canonical, architecture})` belongs

### 1.1 The current pattern

Two layers exist and both are live.

**Layer A — a resource class on `Client`.** Every `backend.ai-client` resource
class takes the client in its constructor and issues
`client.newSignedRequest(method, path, body)` → `client._wrapWithPromise(rqst)`.

- `newSignedRequest(method, queryString, body?, serviceName?, secure?): requestInfo`
  — `packages/backend.ai-client/src/client.ts:1893-1898`. It JSON-encodes the
  body (`:1917-1919`); in `SESSION` connection mode it rewrites the URI to
  `endpoint + '/func' + queryString` for anything not under `/server`
  (`:1930-1938`), and in `API` mode it HMAC-signs and hits
  `endpoint + queryString` (`:1959-1967`). A `POST /admin/images/rescan`
  therefore lands at `<endpoint>/func/admin/images/rescan` behind the
  webserver and `<endpoint>/admin/images/rescan` in API mode — the caller
  passes the bare path either way.
- `_wrapWithPromise(rqst, rawFile?, signal?, timeout?, retry?, opts?): Promise<any>`
  — `packages/backend.ai-client/src/client.ts:276-283`. Default timeout
  `requestTimeout = 30_000` ms (`:230`); a soft-timeout DOM event fires at
  `requestSoftTimeout = 20_000` ms (`:231`, `:327-332`).
- Worked examples in the image/registry area:
  `packages/backend.ai-client/src/resources/container-image.ts:62-67` and
  `:159-163`; `packages/backend.ai-client/src/resources/registry.ts:10-14`;
  `packages/backend.ai-client/src/resources/maintenance.ts:77-84`
  (`recalculate_usage`, which also shows the `is_superadmin` guard and a
  custom timeout).
- Resource classes are constructed in the `Client` constructor (`client.ts:210`
  for `image`, `:221` for `maintenance`, `:223` for `registry`) and re-exported
  from `packages/backend.ai-client/src/resources/index.ts:8`, `:15`, `:18`.

**Layer B — a typed generic helper called straight from React.**
`react/src/helper/index.tsx:25-37` exports
`baiSignedRequestWithPromise<ResponseType>({ method, url, body, client })`, and
`:40-56` the hook `useBaiSignedRequestWithPromise()` which binds the suspended
client. BUI carries the same pair without the generic —
`packages/backend.ai-ui/src/hooks/useBAISignedRequestWithPromise.ts:3-16`,
`:18-35`.

### 1.2 There is no `/admin/…` REST wrapper today

Across the whole client package the only `/admin` path is the GraphQL endpoint:
`packages/backend.ai-client/src/client.ts:1877`
(`newSignedRequest('POST', '/admin/gql', …)`). The map's note that
"`backend.ai-client` has no wrapper for `/admin/images/rescan` yet" is correct,
and there is **no REST `/admin/…` precedent in the client at all**.

### 1.3 Recommendation — use Layer B, do not add a client method

**This sharpens the ticket's framing.** The ticket asks where a `scanImage()`
method belongs on `client.ts`. The better-supported answer is: **do not add
one.** The closest existing analogue to the Add-image modal is
`react/src/components/ImportFromHuggingFaceModal.tsx` — a modal that issues a
REST `POST` from a `useTanMutation`, with no client-class wrapper
(`:185-201`; a GET on the same helper at `:148-156`).

```ts
// react/src/components/ImportFromHuggingFaceModal.tsx:185-201
const importAndStartService = useTanMutation({
  mutationFn: (values) =>
    baiSignedRequestWithPromise({
      method: 'POST',
      url: '/services/_/huggingface/models',
      body: { huggingface_url: values.huggingFaceUrl, /* … */ },
      client: baiClient,
    }),
});
```

Reasons to prefer it here:

1. **Every** file under `packages/backend.ai-client/src/resources/` starts with
   `// @ts-nocheck` — `container-image.ts:1`, `maintenance.ts:1`,
   `registry.ts:1`, and every sibling. A method added there **cannot be typed**
   without lifting `@ts-nocheck` off the whole file, which is exactly what the
   ticket wants (`RescanImagesResponse` typed end to end).
2. `baiSignedRequestWithPromise<ResponseType>` (`react/src/helper/index.tsx:25`)
   is generic, so the response type lands with zero plumbing.
3. The modal submits **several lines per submission** (map Notes) and needs
   per-line result state. That is `useTanMutation` territory
   (`react/src/hooks/reactQueryAlias.tsx:17`), not a single client method.

If a client-class method is wanted anyway (for CLI/E2E reuse), its correct home
is `ContainerImage` in
`packages/backend.ai-client/src/resources/container-image.ts` — beside
`install()` at `:103` and `get()` at `:157` — reachable as
`baiClient.image.scanImage(…)` through `client.ts:210`. It would inherit
`@ts-nocheck` and return `Promise<any>`.

### 1.4 The response type to declare

Derived from `RescanImagesResponse` / `ImageDTO`
(`src/ai/backend/common/dto/manager/image/response.py:89-93`, `:52-73`).
Put it next to the modal (or in `react/src/helper/types.tsx`); the client
package cannot host it while `@ts-nocheck` stands.

```ts
export interface ScanImageResponse {
  item: {
    id: string;                 // UUID
    name: string;               // canonical image name
    registry: string;
    registry_id: string;        // UUID
    project: string | null;
    tag: string | null;
    architecture: string;
    size_bytes: number;
    type: string;               // compute | system | service
    status: string;             // ALIVE | DELETED
    labels: Array<{ key: string; value: string }>;
    tags: Array<{ key: string; value: string }>;
    resource_limits: Array<{ key: string; min: string | number; max: string | number | null }>;
    accelerators: string | null;
    config_digest: string;
    is_local: boolean;
    created_at: string | null;  // ISO-8601
  };
  errors: string[];
}
```

`min` / `max` are pydantic `Decimal`
(`src/ai/backend/common/dto/manager/image/response.py:48-49`), which serialize
as a JSON number or string depending on the encoder — hence the union. The
modal needs only `item.name`, `item.tag`, `item.architecture` and
`item.registry` / `item.project` for a result row.

### 1.5 How errors surface

`_wrapWithPromise` **throws a plain object, not an `Error`**
(`packages/backend.ai-client/src/client.ts:482-502`):

| Field | Line | Note |
|---|---|---|
| `isError: true` | `:483` | |
| `type` | `:485` | a URI string such as `https://api.backend.ai/probs/server-error` (`:431`), or one of the `Client.ERR_*` sentinels (`:170-175`) |
| `statusCode` / `statusText` | `:489-490` | HTTP status; `408` is synthesised for abort (`:452`) and timeout (`:459`) |
| `title` | `:492` | the manager's `title` |
| `msg` | `:494` | manager `msg`, since 24.09.0 |
| `message` | `:497` | deprecated composite string |
| `description` | `:498` | |
| **`error_code`** | `:498` | read off the JSON body at `:360` |
| `traceback` | `:499` | |
| `response` | `:501` | the parsed body |

Non-2xx JSON bodies are parsed before the throw (`:354-362`), so `error_code`
and `title` are available for classification. `error_code` is the manager's
`ErrorCode.__str__` — `"{domain}_{operation}_{error_detail}"`
(`src/ai/backend/common/exception.py:324-325`).

**Classification table for the modal:**

| Case | HTTP | `error_code` | Source |
|---|---|---|---|
| Image not in the DB (today's behaviour, pre-prerequisite) | 404 | `image_read_not-found` | `ImageNotFound(ObjectNotFound)` — `src/ai/backend/manager/errors/image.py:22-31` |
| Registry row missing for a resolved image | 404 | an `ObjectNotFound` code | `src/ai/backend/manager/errors/image.py:196`; raised at `db_source.py:307-308` |
| **Unknown registry** (canonical prefix matches no `(registry_name, project)` row) | — | — | Indistinguishable server-side, because resolution is DB-first. **Detect it client-side**: match the parsed prefix against the registry list before submitting (map Notes: `canonical.startswith(registry_name + "/" + project + "/")`). This is also what drives the nested Add-registry flow in §3. |
| Registry auth failure | 4xx/5xx propagated from `registry_login` | varies | `src/ai/backend/manager/container_registry/base.py:283-288` |
| **Tag/manifest not found** | **500** (`IndexError`), no body | none | `base.py:363-366` swallows the registry 404 → `service.py:388` indexes `[0]`. See §0. |
| Not superadmin | 403 | auth middleware | `src/ai/backend/manager/api/rest/image/registry.py:20` |
| Client-side timeout | `statusCode: 408`, `statusText: 'Timeout exceeded'` | none | `packages/backend.ai-client/src/client.ts:456-460` |

Precedent for `error_code`-based branching in this repo:
`react/src/pages/SessionLauncherPage.tsx:572-584` and
`react/src/components/FolderInvitationResponseModal.tsx:125`. For the
user-facing message, `usePainKiller().relieve(err.title)`
(`react/src/hooks/usePainKiller.tsx`; used at
`react/src/components/ContainerRegistryList.tsx:67`, `:229`) is the house style.

---

## 2. Version gating

### 2.1 How flags are declared

- Storage: `public _features: FeatureSet`
  (`packages/backend.ai-client/src/client.ts:159`), initialised `{}` at `:234`.
  `FeatureSet = Record<string, boolean>`
  (`packages/backend.ai-client/src/types.ts:124`) — **untyped keys, no union**,
  so adding a flag is a one-line change with no type to update.
- Reader: `supports(feature: string): boolean` (`client.ts:634-644`) — lazily
  calls `_updateSupportList()` when `_features` is empty (`:635-637`) and
  returns `false` for unknown keys (`:641`).
- Declaration site: `_updateSupportList()` (`client.ts:661`), a flat list of
  `if (this.isManagerVersionCompatibleWith('<v>')) { this._features['<key>'] = true; }`
  blocks in ascending version order (`:662` through `:1012`).
- `isManagerVersionCompatibleWith(version: string | string[])`
  (`client.ts:1018-1025`): a string is PEP-440 compared `>= version` (`:1023`);
  an array is OR-ed across independent release lines through
  `isCompatibleMultipleConditions` (`:1021`) — the array form is how a fix
  backported to several branches is expressed (`client.ts:791`, `:815`, `:819`).
- `get managerVersion()` returns `this._managerVersion`
  (`client.ts:255-257`), populated once by `get_manager_version()` from
  `getServerVersion()` (`client.ts:614-628`). It is `null` before login and
  `isManagerVersionCompatibleWith` coerces that to `''` (`client.ts:1019`) — so
  **every flag reads `false` until the version is known**, which is the safe
  default for a hide-guard.

The cited example:

```ts
// packages/backend.ai-client/src/client.ts:832-834
if (this.isManagerVersionCompatibleWith('25.1.0')) {
  this._features['image_rescan_by_project'] = true;
  this._features['auto-scaling-rule'] = true;
}
```

Its single consumer **degrades rather than hides** — it drops the `project`
argument on older managers:
`react/src/components/ContainerRegistryList.tsx:236-243`.

### 2.2 Flags keyed to a REST capability — yes, several

| Flag | Declared | Gates |
|---|---|---|
| `background-file-delete` | `client.ts:859` | picks the REST path `…/delete-files-async` vs `…/delete-files` — `packages/backend.ai-client/src/resources/vfolder.ts:406-411` |
| `download-archive` | `client.ts:884` | shows a REST-backed download button — `packages/backend.ai-ui/src/components/baiClient/FileExplorer/ExplorerActionControls.tsx:194` |
| `export-csv` | `client.ts:877` | `react/src/hooks/useCSVExport.ts:120` |
| `extend-login-session` | `client.ts:795` | `react/src/components/MainLayout/WebUIHeader.tsx:113-114` |

`background-file-delete` is the closest precedent: a REST-only capability, a
kebab-case key, one line in the same style. **Gating the Add-image button on a
`supports()` flag is idiomatic — no new mechanism is needed**, which settles
the map's open item "`baiClient.supports(...)` flag vs probing the endpoint" in
favour of the flag.

### 2.3 Recommendation

- **Flag name:** `scan-image-by-canonical` (kebab-case), matching the REST-flag
  precedents above and the uniformly kebab-case recent blocks
  (`client.ts:875-1012`). Avoid the snake_case spelling of
  `image_rescan_by_project`: it is the minority style (`client.ts:833`, `:837`).
- **Version:** not yet knowable — it depends on which core release ships the
  prerequisite (map, "Not yet specified"). Add the block in ascending order
  after `client.ts:1003-1012` once the release is known.
- **Guard shape: hide, not disable.** The house pattern for an action the
  manager cannot serve is to render nothing:
  - `react/src/pages/EnvironmentPage.tsx:65-72` hides the whole **Registries**
    tab with `baiClient.is_superadmin && { … }` inside `filterOutEmpty([…])` —
    the closest structural precedent, on this very page;
  - `react/src/components/AdminUserManagement.tsx:510` —
    `{bailClient.supports('bulk-create-user') && (<Button … />)}`;
  - `react/src/components/AgentSettingModal.tsx:141` — same shape.
- **Guard on both conditions:**
  `baiClient.is_superadmin && baiClient.supports('scan-image-by-canonical')`.
  The endpoint is `superadmin_required`
  (`src/ai/backend/manager/api/rest/image/registry.py:20`), and the Environments
  route is `handle.scope: 'admin'`, **not** `access: 'superadmin'`
  (`react/src/routes.tsx:777`, `:783-787`; contrast `maintenance` at `:916`,
  `:925`). A plain (non-super) admin therefore reaches the Images tab today,
  and the existing "Install image" button carries **no role guard at all**
  (`react/src/components/ImageList.tsx:593-608`). The Add-image button must add
  the `is_superadmin` check itself.

---

## 3. The nested Add-registry modal

### 3.1 The component

`react/src/components/ContainerRegistryEditorModal.tsx` (572 lines). Opened by
the "Add registry" button at
`react/src/components/ContainerRegistryList.tsx:473-480`
(`label={t('registry.AddRegistry')}`, `onClick → setIsNewModalOpen(true)`);
rendered at `:524-548`, with `open={!!editingRegistry || isNewModalOpen}`
(`:526`) over state at `:193` and `:197`.

Its entire own-prop surface:

```ts
// react/src/components/ContainerRegistryEditorModal.tsx:42-48
interface ContainerRegistryEditorModalProps
  extends Omit<BAIModalProps, 'onOk'> {
  onOk: (type: 'create' | 'modify') => void;                       // :46, required
  containerRegistryFrgmt?: ContainerRegistryEditorModalFragment$key | null; // :47
}
```

Everything else is inherited `BAIModalProps` (`open`, `onCancel`, …), spread
through at `:51` → `:271`. The interface is **not exported**; only the default
export at `:572`.

### 3.2 It cannot be pre-filled today — this contradicts the map

The map's baseline decision reads: "Unregistered registry: open the existing
**Add registry** modal on top of this modal, **pre-filled from the parsed
prefix**". The nesting half is fine (§3.3). **The pre-fill half is not
possible without changing the component.**

- The only data input is `containerRegistryFrgmt`, a **Relay fragment key**
  (`:47`), consumed by `useFragment` at `:61-87`. It requires a real fragment
  ref with `$fragmentSpreads` metadata — a hand-built plain object will not do.
- `initialValues` is a ternary on that fragment (`:277-296`); the **create**
  branch is hardcoded `{ is_global: true, ssl_verify: true }` (`:295`). There
  is no prop to seed `registry_name` / `url` / `project`.
- A truthy fragment also *switches the modal into modify mode* throughout:
  title and OK label flip (`:240-245`), `registry_name` becomes `disabled`
  (`:321`), the password field becomes "no change" plus a "Change password"
  checkbox (`:402-407`, `:412-423`), and `handleSave` routes to the **modify**
  mutation (`:176-203`).

So prefilled-create needs a **new prop** — e.g.
`initialValues?: Partial<{ registry_name: string; url: string; project: string }>`
merged into the create branch at `:295`, deliberately kept orthogonal to the
fragment so it does not trip the modify-mode switches.

### 3.3 The completion callback returns nothing useful

- `onOk(type)` receives only `'create' | 'modify'` (`:46`), fired at `:227`
  (create) and `:197` (modify). It does **not** hand back the created
  registry — no id, no name, no row. `ContainerRegistryList.tsx:527-542` copes
  by showing a message and calling `updateFetchKey()`.
- `onCancel` is the inherited `BAIModalProps` one
  (`packages/backend.ai-ui/src/components/BAIModal.tsx:207`); call site
  `ContainerRegistryList.tsx:543-546`. There is **no** `onRequestClose` here.
- The create mutation selects `id` only:

  ```graphql
  # react/src/components/ContainerRegistryEditorModal.tsx:89-100
  mutation ContainerRegistryEditorModalCreateMutation($props: CreateContainerRegistryNodeInputV2!) {
    create_container_registry_node_v2(props: $props) { container_registry { id } }
  }
  ```

  (`:96`) — no `registry_name`, no `project`, no `row_id`. The modify mutation
  at `:102-134` selects the full field set, which is why modify needs no
  refetch. **So even a widened `onOk` would carry nothing the Add-image modal
  could match against without a second selection or a refetch.**

For the Add-image flow the cheapest correct shape is: the outer modal already
knows the `registry_name` / `project` it asked for, so on `onOk('create')` it
re-runs its own registry lookup (refetch) and matches by those values, rather
than depending on the callback payload. Widening the mutation's selection set
to include `registry_name` and `project` is the cleaner fix if the prototype
wants the identity back directly.

### 3.4 Rendering it from `ImageList.tsx` — no environmental blocker

Imports at `react/src/components/ContainerRegistryEditorModal.tsx:5-25`:

| Dependency | Line | Blocks use from `ImageList.tsx`? |
|---|---|---|
| `react-relay` (`graphql` / `useFragment` / `useMutation`) | `:25` | No — needs a `RelayEnvironmentProvider`, which `ImageList` already sits under (`react/src/components/ImageList.tsx:231`) |
| `useSuspendedBackendaiClient` | `:10`, used `:56` | Suspends — needs a Suspense boundary; `ImageList.tsx:58`, `:131` and `EnvironmentPage.tsx:74` provide them |
| `App` from `../app-shim` (`message`, `modal`) | `:8`, `:54` | No — app-global; `ImageList.tsx:10` imports the same `App` |
| `useTranslation`, `registry.*` keys | `:24` | No — same host i18n instance |
| `ProjectSelectForAdminPage` | `:15`, rendered `:519-523` | No; network-only fetch behind its own Suspense (`:508`), only when `is_global` is unchecked (`:504-527`) |
| `BAICodeEditor`, `BAIFormItem`, `HiddenFormItem`, `astryxFormControls`, `Form`, `theme-shim` | `:9`, `:11-14`, `:16-20` | No — all `react/src`-local |
| `backend.ai-ui` (`BAIFlex`, `BAIModal`, `BAISelect`) | `:21` | No |

No host router, no jotai atoms, nothing `ImageList` lacks. Both files are
siblings in `react/src/components/`, under the same Relay environment and
Suspense in `EnvironmentPage`. **The blockers are the props (§3.2, §3.3), not
the environment.** Note the Registries tab is superadmin-gated
(`react/src/pages/EnvironmentPage.tsx:68-71`) while the Images tab is not — the
Add-image button must carry its own guard (§2.3).

### 3.5 `BAIModal` supports stacking — by design, with tests

`packages/backend.ai-ui/src/components/BAIModal.tsx` is a prop-compatible
antd-`Modal` shim over Astryx (header comment `:1-72`).

- **Render path.** `BAIModal` → `BAIDialog` → Astryx `<Dialog isInline isOpen>`
  (`BAIModal.tsx:720-738`, body/footer `:739-760`). `BAIDialog` **portals into
  `document.body`** with `createPortal`
  (`packages/backend.ai-ui/src/components/BAIDialog.tsx:292-347`, `document.body`
  at `:346`) — deliberately not a native `<dialog>` / `showModal()` top-layer
  promotion, so the notification stack stays above and clickable
  (`BAIDialog.tsx:5-12`). A closed `BAIModal` renders nothing
  (`BAIModal.tsx:441`; `destroyOnHidden` is always on, PILOT-DECISION 3 at
  `:44-46`).
- **z-index.** Owned by a shared module-level stack, not CSS order:
  `packages/backend.ai-ui/src/components/dialogLevelStack.ts`. Band base
  `modalBase: 1100`, step `BAI_Z_INDEX_MODAL_LEVEL_STEP = 10`
  (`packages/backend.ai-ui/src/styles/zIndexLadder.ts:29`, `:39`), ceiling
  `MAX_DIALOG_Z_INDEX = notification - 1` (`zIndexLadder.ts:35`,
  `dialogLevelStack.ts:37`). `resolveDialogZIndex` always places a new dialog
  one step above the current topmost, **even if an earlier dialog passed a
  higher explicit `zIndex`** (`dialogLevelStack.ts:59-84`, `:82-83`). Level and
  z are published as CSS vars on the portal root (`:162-163`) and consumed by
  `packages/backend.ai-ui/src/components/BAIDialog.css:17`. Nesting is clamped
  at `MAX_DIALOG_LEVEL = 80` (`dialogLevelStack.ts:29`, applied `:113`).
- **Focus trap.** `useFocusTrap` is gated on topmost only —
  `isActive: isOpen && isTopmost` (`BAIDialog.tsx:165-168`). Covered dialogs are
  additionally `inert`-ed (`dialogLevelStack.ts:93-104`, `:96`; the comment at
  `:86-92` explains why both are needed). Trigger capture before inerting at
  `BAIDialog.tsx:153-157`; focus restore on close at `:33-42`, `:173-184`.
  `findDialogTitle` explicitly skips headings belonging to a nested dialog
  (`BAIDialog.tsx:44-55`, used `:191-207`).
- **Escape ordering.** Escape flows through the focus trap's `onEscape`, active
  only on the topmost dialog, so **Escape closes the top modal only**
  (`BAIDialog.tsx:143-147`, `:165-168`; comment `:158-160`).
  `allowEscape = purpose !== 'required'`,
  `allowBackdropClick = purpose === 'info'` (`:137-138`); `BAIModal` maps antd's
  `maskClosable` / `keyboard` / `mask` onto `purpose` at `BAIModal.tsx:481-492`.
  Close path: `onOpenChange(false)` → `BAIModal.tsx:723-725` → `handleCancel`
  `:461-478` (runs `confirmBeforeClose` first, `:462-469`).
- **Tests that pin stacking:**
  `packages/backend.ai-ui/src/components/BAIDialog.test.tsx:197-213`
  ("stacks dialogs from level 0 upward"), `:217-250` ("keeps Tab inside a
  dialog opened on top of another" — literally a `<BAIDialog>` inside a
  `<BAIDialog>` at `:227-234`), `:265` (later dialog paints above an earlier
  `zIndex` override), `:304` (focus restores to the trigger inside the opener);
  plus `packages/backend.ai-ui/src/components/dialogLevelStack.test.ts:45`,
  `:57`, `:68`, `:81`, `:105`, `:124`.

### 3.6 Existing nested-modal precedent — plenty

**This also sharpens the map**, which treated the nested modal as a design risk.
It is an established pattern:

- `react/src/components/UserSettingModal.tsx` — outer `BAIModal` closes at
  `:1376`; inside it `TOTPActivateModal` `:1333-1346`,
  `GeneratedKeypairListModal` in a `BAIUnmountAfterClose` `:1347-1364`,
  `BulkCreateUserErrorModal` `:1369-1374` (with a hand-off comment at
  `:1365-1368`, FR-3419).
- `react/src/components/FolderExplorerModal.tsx:333-347` —
  `VFolderTextFileEditorModal` inside `BAIUnmountAfterClose`, inside the outer
  `BAIModal` (closing `:348`).
- `react/src/components/SSHKeypairManagementModal.tsx:56-110` — outer modal
  `:56-88`, then `SSHKeypairGenerationModal` `:89-98` and
  `SSHKeypairManualFormModal` `:99-110`, opened from the outer modal's own
  footer buttons (`:72`, `:77`).
- `react/src/components/MyKeypairManagementModal.tsx:719` —
  `BAIDeleteConfirmModal` as a sibling under the same fragment, both open at
  once.
- Further instances: `BulkCreateUserFromCSVModal.tsx:1453`, `:1474`;
  `DeploymentAddRevisionModal.tsx:324`, `:354`; `ModelCardDeployModal.tsx:349`;
  `VFolderDeployModal.tsx:376`; `AssignRoleModal.tsx:317`;
  `RoleScopePermissionEditModal.tsx:868`; `SignupModal.tsx:292`, `:297`;
  `UserProfileSettingModal.tsx:410`; `ShellScriptEditModal.tsx:318`;
  `PurgeUsersModal.tsx:142`; `TableColumnsSettingModal.tsx:84`.
- `ContainerRegistryEditorModal.tsx:258-264` already opens a `modal.confirm()`
  from inside its own `BAIModal`; the imperative shim rides the same level
  stack (`packages/backend.ai-ui/src/app-shim/modal.tsx:283-288`, comment
  `:329-333`).

Two habits worth copying: wrap the inner modal in `BAIUnmountAfterClose` so its
state resets on close (`UserSettingModal.tsx:1347`,
`FolderExplorerModal.tsx:333`, and `ImageList.tsx:699` already does this for
`ImageInstallModal`), and drive the inner modal's `open` from outer-modal state
rather than conditionally mounting it.

---

## 4. List refresh, sort and filters

### 4.1 What drives the list

- Query `ImageListQuery`, a single `useLazyLoadQuery` orchestrator —
  `graphql` tag at `react/src/components/ImageList.tsx:231-290`, name at `:233`.
  No fragment drives the list itself; child modals take fragment spreads
  (`:273-275`).
- Root field **`image_nodes`**, arguments
  `scope_id: $scopeId, offset: $offset, first: $first, filter: $filter, order: $order`
  (`react/src/components/ImageList.tsx:240-246`; variable declarations
  `:233-239`). Schema signature at `data/schema.graphql:16200-16215`.
- Variables object at `react/src/components/ImageList.tsx:221-227`.
- **Pagination mode:** offset/page-number, expressed as the legacy
  `first` + `offset` mix that the non-Strawberry `*_nodes` connections tolerate
  (`:223-224`) — not `limit` + `offset`, not cursors. `pageInfo` is not
  selected; `count` (`:278`) feeds `pagination.total` (`:611-620`). Per
  `.claude/rules/graphql-pagination.md` this is the tolerated legacy shape;
  do not copy it onto a `*V2` connection.
- Page state is URL-persisted:
  `useBAIPaginationOptionStateOnSearchParam({ current: 1, pageSize: 20 })`
  (`react/src/components/ImageList.tsx:205-212`; hook at
  `react/src/hooks/reactPaginationQueryOptions.tsx:368-388`).
- Scope: `project:<id>` when a project is picked, otherwise
  `domain:<baiClient._config.domainName>`
  (`react/src/components/ImageList.tsx:124-126`).

### 4.2 The fetchKey pattern

It is **`useFetchKey` + `fetchKey`/`fetchPolicy` on `useLazyLoadQuery`** — not
`useRefetchableFragment`, and **not** `BAIFetchKeyButton` (this list hand-rolls
a plain Astryx `IconButton`).

| Step | Where |
|---|---|
| `const [fetchKey, updateFetchKey] = useFetchKey();` | `react/src/components/ImageList.tsx:187` |
| `useFetchKey` implementation (`useDateISOState(INITIAL_FETCH_KEY)`, `INITIAL_FETCH_KEY = 'first'`) | `packages/backend.ai-ui/src/hooks/index.ts:61-64`; `useDateISOState` `:47-55`; `useUpdatableState` alias `:57-59` |
| `const deferredFetchKey = useDeferredValue(fetchKey);` | `react/src/components/ImageList.tsx:229` |
| Query options: `fetchPolicy: deferredFetchKey === INITIAL_FETCH_KEY ? 'store-and-network' : 'network-only'`, `fetchKey: deferredFetchKey` | `react/src/components/ImageList.tsx:283-289` |
| Manual refresh: `startRefreshTransition(() => updateFetchKey())` | `:579-588`; transition state `:194` |
| Loading indicator from the deferred-vs-current mismatch | `:637-640` |
| Post-mutation refetch precedent: `ManageImageResourceLimitModal` `onRequestClose(success)` → `updateFetchKey()` | `:672-678`; same for `ManageAppsModal` `:681-691` |
| `ImageInstallModal` does **not** refetch — it only sets local `installingImages` | `:189`, `:699-708`; `react/src/components/ImageInstallModal.tsx:254` |

So the Add-image modal's completion handler follows the
`ManageImageResourceLimitModal` shape: `onRequestClose(success)` →
`updateFetchKey()`. There is **no auto-refresh interval on this list**.

`BAIFetchKeyButton` (`packages/backend.ai-ui/src/components/BAIFetchKeyButton.tsx:39-86`)
is available if the prototype wants the richer control:
`onChange: (fetchKey: string) => void` is the only required prop (`:63`);
`value` is accepted but unread — the button self-generates the key (`:50`,
`:215`); passing `onChangeAutoUpdateDelay` (`:74`) opts into the interval
dropdown (`:123`), otherwise it renders as a single refresh button
(`:340-351`).

### 4.3 Default sort

**There is no client-side default order.** `order` is a nuqs
`parseAsStringLiteral(availableImageSorterValues)` with **no `.withDefault(…)`**
(`react/src/components/ImageList.tsx:214-219`), so it is `null` on first load
and becomes `order: undefined` in the variables (`:226`) — the argument is
omitted and the **manager's own default ordering** applies. No column declares
`defaultSortOrder`, so `BAITable`'s uncontrolled seed path does not apply
either (`packages/backend.ai-ui/src/components/Table/BAITable.tsx:594-606`);
the table is order-controlled because it wires `onChangeOrder`
(`ImageList.tsx:641-648`). Sortable fields are limited to `registry`,
`architecture`, `namespace`, `base_image_name` and their `-` descending forms
(`:70-81`, applied `:352`, `:358`, `:364`, `:370`).

**Consequence for the modal:** where a freshly added image lands is decided by
the manager, not the UI. It may not be on page 1. The map already excludes a
row highlight, so a toast plus a refetch is the whole affordance.

### 4.4 Filters that could hide a freshly added image

| Filter | Default | Where | Can it hide a new image? |
|---|---|---|---|
| **Installed-only toggle** | **does not exist** | — | No |
| Project scope / `scope_id` | page `?project=` is `parseAsString` with **no** `.withDefault` → unset → `domain:<domainName>` (widest) | `react/src/pages/EnvironmentPage.tsx:43-46`, `:54-59`, `:82-87`; `ImageList.tsx:124-126` | Only if the user picked a project the image is not in |
| Project select in the filter row (`allowClear`, placeholder `environment.AllProjects`) | cleared | `react/src/components/ImageList.tsx:128-153` | As above |
| `BAIPropertyFilter` | `imageFilter` state `''` → `filter: undefined` | state `:191`, variable `:225`, control `:487-570` | Only if the user typed one |
| ↳ `status` property (`ALIVE` / `DELETED`) | not applied | `:536-546` | Only if chosen |
| ↳ `type` (`COMPUTE` / `SERVICE` / `SYSTEM`) | not applied | `:547-558` | Only if chosen |
| ↳ `registry`, `namespace`, `base_image_name`, `tag`, `name`, `image`, `id`, `architecture`, `is_local` | not applied | `:490-563` | Only if chosen |
| **`filter_by_statuses`** | **never passed** → server default `[ALIVE]` | absent from `:240-246`; schema default `data/schema.graphql:16206` | Silently, yes — but a freshly registered image is `ALIVE`, so not the usual culprit |
| `permission` argument | never passed → server default `"read_attribute"` | `data/schema.graphql:16204` | Only via permission scoping |
| Pagination | `current: 1`, `pageSize: 20`, URL-persisted | `react/src/components/ImageList.tsx:205-212` | **Yes** — a stale `?current=N` in the URL, or an image that sorts onto a later page |
| Hidden-column setting | user setting; hides *columns*, never rows | `:470-471`, `:633-636`; `react/src/hooks/useHiddenColumnKeysSetting.tsx:18-24` | No (but can hide the Status column) |
| Customized-images tab | not on this page — `CustomizedImageList` lives on `/my-environment` | `react/src/pages/MyEnvironmentPage.tsx:36`; `react/src/components/CustomizedImageList.tsx:48` | n/a |

**Net: nothing filters by installed state by default.** A
registered-but-uninstalled image appears, badge-less, provided its status is
`ALIVE`. The only realistic "out of view" risks are pagination (§4.3) and a
project scope the user narrowed by hand.

### 4.5 "Installed on agents" vs "registered only"

- The list selects **`installed` only** (`react/src/components/ImageList.tsx:255`).
  Schema: `ImageNode.installed: Boolean`, *"Added in 25.11.0. Indicates if the
  image is installed on any Agent."* (`data/schema.graphql:9150-9151`).
- `installed_agents` is **not** used — it exists only on the legacy `Image`
  type (`data/schema.graphql:9053`). `ImageNode.status`
  (`data/schema.graphql:9138`) is not selected either; status is reachable only
  through the `filter` string.
- Rendering — the `environment.Status` column, `dataIndex: 'installed'`
  (`react/src/components/ImageList.tsx:297-326`):
  - optimistic gold `environment.Installing` badge while
    `installingImages.includes(row.id)` (`:306-312`; local state `:189`, fed by
    `react/src/components/ImageInstallModal.tsx:254`);
  - gold `environment.Installed` badge when `row.installed` (`:310-315`);
  - **registered-only renders no badge at all** — the `: null` branch (`:315`).
    There is no "Registered" / "Not installed" label;
  - an orthogonal red `environment.Private` badge from labels (`:316-323`;
    predicate `react/src/helper/index.tsx:524-533`).
- `installed` also gates the Install action (`ImageList.tsx:602-606`;
  `ImageInstallModal.tsx:97-103`).

**So a newly added image is visually indistinguishable from any other
uninstalled image — an empty Status cell.** The spec should say whether that is
acceptable or whether a "Registered" state deserves a label of its own.

### 4.6 Where the button goes

- `ImageList` is rendered by `react/src/pages/EnvironmentPage.tsx:82-87`, inside
  a `BAIErrorBoundary` under a shared `Suspense` (`:74-76`), when
  `currentTab === 'image'` (`:75`). Tabs at `:65-72`: `image` (`:66`, `:82`),
  `preset` (`:67`, `:96`), `registry` (`:68-71`, `:101`, superadmin-hidden).
  Default tab key `'image'` (`:18-22`).
- **The page `BAICard` has no `extra` prop** (`EnvironmentPage.tsx:62-73`), so
  the card header action slot is currently empty. Per
  `.claude/rules/use-bai-card.md` that is where a card-scoped action belongs —
  but the existing image actions are **not** there.
- Today's action row is inside the list, at the right of the filter row
  (`react/src/components/ImageList.tsx:572-609`): `BAISelectionLabel` `:573-578`,
  refresh `IconButton` `:579-588`, and the primary `environment.InstallImage`
  `Button` `:593-608`. **The map's "Images tab header, beside Install image"
  therefore means this row, not the card header.** Adding the button here
  matches the sibling Registries tab, whose refresh + `registry.AddRegistry`
  pair sits in exactly the same place
  (`react/src/components/ContainerRegistryList.tsx:464-472`, `:473-480`).
- **There is no "Rescan images" button on this page.** The two existing rescan
  affordances are the Maintenance page card action
  (`react/src/components/MaintenanceSettingList.tsx:121-133`, handler `:46-86`,
  `baiClient.maintenance.rescan_images()` at `:53`; route is
  `access: 'superadmin'`, `react/src/routes.tsx:925`) and the per-registry row
  action on the Registries tab
  (`react/src/components/ContainerRegistryList.tsx:301-308`, handler `:201-260`).

---

## 5. i18n

### 5.1 Which store

| Component home | Hook | Locale store | Shape |
|---|---|---|---|
| Host `react/src/**` | `useTranslation()` / `<Trans>` | `resources/i18n/*.json` | nested dot-path (`environment.InstallImage`) |
| BUI `packages/backend.ai-ui/src/**` | `useBAIi18n()` / `<BAITrans>` | `packages/backend.ai-ui/src/locale/*.json` | nested, component-scoped `comp:<Name>` objects plus a shared `general` object |

Rules: `CLAUDE.md:70-71` (react-i18next imports inside BUI are ESLint-blocked,
FR-2986); `.github/instructions/i18n.instructions.md:33-38`;
`.claude/rules/bui-component-home.md:23` (a BUI component may not reach into
host `resources/i18n`). BUI examples:
`packages/backend.ai-ui/src/locale/en.json:218-219`
(`comp:BAIImageSelect`), `:109-110`, shared `general` at `:777-807`.

**Decision:** the Add-image modal's sibling `ImageInstallModal` is a host
component using `environment.*`
(`react/src/components/ImageInstallModal.tsx`), and the modal needs
`baiClient.supports()` plus the registry list — so it belongs in
`react/src/components/` and its keys go in **`resources/i18n/en.json` under
`environment.*`**.

### 5.2 The overlapping keys

| Key | Line | English |
|---|---|---|
| `environment.InstallImage` | `resources/i18n/en.json:1496` | `Install Image` |
| `registry.AddRegistry` | `resources/i18n/en.json:2396` | `Add Registry` |
| `maintenance.RescanImages` | `resources/i18n/en.json:2018` | `Rescan Images` |
| `registry.RescanImages` | `resources/i18n/en.json:2433` | `Rescanning Images...` |

Note the last two: **the same leaf name carries two different values** in the
`maintenance` and `registry` namespaces — one is a button label, the other a
progress message. Do not assume a `RescanImages` key means what its name says.

`environment.*` opens at `resources/i18n/en.json:1464` and closes at `:1535`.
Keys most likely to be reused or confused with new ones:
`AlreadyInstalledImage` `:1467`, `BaseImageName` `:1474`, `FullImagePath`
`:1491`, `Image`/`Images` `:1493-1494`, `Install` `:1495`,
`InstallSessionProject` `:1497` + `…Tooltip` `:1498`,
`InstallTargetResourceGroup` `:1499` + `…Tooltip` `:1500`, `Installed` `:1501`
(`installed`), `Installing` `:1503` (`installing`), `NoImageToDisplay` `:1511`,
`Registries`/`Registry` `:1522-1523`, `SearchImages` `:1527`,
`SuccessfullyCreated` `:1531`.

The registry-creation vocabulary the nested modal already uses lives at
`registry.*` `:2395-2439` — `RegistryName` `:2421`, `RegistryHostname` `:2419`,
`RegistryURL` `:2429`, `ProjectName` `:2416`, `Type` `:2436`,
`RegistrySuccessfullyAdded` `:2423`, `RegistryNameAlreadyExists` `:2422`.
**Reuse these; do not restate them under `environment.*`.**

### 5.3 The name is unclaimed

Greps over both stores: **`AddImage` — zero hits. `ScanImage` — zero hits.**
`Rescan` appears only in the host store at
`resources/i18n/en.json:2005`, `:2014`, `:2015`, `:2016`, `:2017`, `:2018`,
`:2432`, `:2433`; the BUI store has none of the three. So
**`environment.AddImage` is clean**.

### 5.4 Conventions a new `environment.AddImage` family must follow

From the `fw:i18n-patterns` skill plus this repo's
`.github/instructions/i18n.instructions.md`, and **mechanically enforced** by
`resources/i18n.schema.json:13-19` (and the identical
`packages/backend.ai-ui/i18n.schema.json:13-19`):

1. **Casing is typed.** A key whose value is an **object** starts lowercase
   (`environment`, `dialog`, `ask`, `button`); a key whose value is a **string**
   starts uppercase (`AddImage`). So `environment.AddImage` — never
   `environment.addImage`, never `Environment.AddImage`.
2. **Reuse the `environment` namespace.** Every image string already lives
   there (`:1464-1535`); the surrounding style is flat leaves, not a nested
   `addImage: { … }` sub-object.
3. **Value register by role.** Titles and button labels are Title Case
   (`"Install Image"`, `"Add Registry"`); descriptions and messages are
   sentence case with terminal punctuation
   (`"Installed images are excluded."`).
4. **Name shapes already in use:** modal title / primary action
   `environment.AddImage`; explanatory body `Desc<Thing>`
   (`environment.DescInstallRunsSession`, `registry.DescURLFormat`); field
   tooltip `<Field>Tooltip` (`environment.InstallSessionProjectTooltip`);
   validation `<Field>IsRequired` / `<Field>AlreadyExists`
   (`registry.ProjectNameIsRequired`, `registry.RegistryNameAlreadyExists`);
   toasts `<Thing>SuccessfullyAdded` / `FailedTo<Verb><Thing>`
   (`registry.RegistrySuccessfullyAdded`,
   `environment.FailedToDeleteCustomizedImage`). Placeholders sit in the
   feature namespace as plain labels (`environment.SearchImages`,
   `registry.PleaseSelectOption`).
5. **Shared namespaces instead of feature-local duplicates:** `button.*`
   (`resources/i18n/en.json:390`; `Add` `:391`, `Cancel` `:394`, `Create`
   `:406`, `Save` `:440`) for the footer; `dialog.ask.*` (`:1412-1417`) for
   generic confirmations; `dialog.title.*` `:1424-1428`;
   `dialog.PleaseTypeToConfirm` `:1410`.
6. **Never concatenate translated fragments** — one key with `{{placeholder}}`
   (i18next syntax per `i18n.config.js:36-39`), placeholders preserved in every
   language.

### 5.5 Terminology

`packages/backend.ai-webui-docs/terminology.json`:

- `:318-325` `id: "kernel-image"`, preferred EN
  **`"Kernel image / Container image"`** (`:323`); description `:325` — *"The
  base image (snapshot) from which containers are created. Do NOT use
  'container' and 'kernel' interchangeably."* Related: `:313-322`
  `id: "container"`, preferred `"Container"`.
- **No `avoid[]` row exists for "image", "install", "register", "registry" or
  "scan".** The `avoid[]` array (`:614-800`) covers only scaling group→resource
  group `:616`, key pair→keypair `:624`/`:632`, group→project `:640`,
  organization→domain `:648`, data folder `:656`, worker node `:664`, compute
  node `:672`, WSProxy `:680`, and the ko/ja/th rows `:688-792`.
- The `verbs[]` list (`:802-905`) has **no** `verb-add`, `verb-create`,
  `verb-install`, `verb-register` or `verb-scan`. Two entries do constrain this
  work: `verb-delete` `:814-821` (preferred `"Delete"`,
  `avoid: ["Destroy","Erase","Wipe"]` `:820`; its context explicitly names
  *image*, `:817`) and **`verb-edit` `:898-905` (preferred `"Edit"`,
  `avoid: ["Modify","Update"]` `:904`; context explicitly names *registry*,
  `:901`)**. So no new string may say "Modify Image" / "Update Image", and an
  edit form's submit button is `button.Save`.
- Precedence when sources disagree (`CLAUDE.md:115`): the live i18n label wins
  over `terminology.json`, which wins over the style guide.

**The map's open item "Add image vs Install image terminology" is therefore not
constrained by `terminology.json`** — nothing forbids either word. The
distinction the copy must carry is the one the UI already encodes:
*Install* pulls an image onto agents (an enqueued session,
`environment.DescInstallRunsSession` `:1483`), while *Add* would register it in
the manager DB. The prototype should pick wording that keeps those apart.

### 5.6 Languages and gates

- **21 locale files** in `resources/i18n/` and 21 in
  `packages/backend.ai-ui/src/locale/` (de, el, en, es, fi, fr, id, it, ja, ko,
  mn, ms, pl, pt-BR, pt, ru, th, tr, vi, zh-CN, zh-TW). `CLAUDE.md:69` says
  "22 languages" — stale relative to the directory.
- `make i18n` = `Makefile:261-262` → `pnpm exec i18next-scanner --config ./i18n.config.js`.
  Its `input` (`i18n.config.js:5-8`) is `./src/**/*.ts` + `./react/src/**/*.tsx`
  — **it never scans `packages/backend.ai-ui/src`**, so BUI keys are added by
  hand. Its `lngs` (`:18`) lists **20 languages — `th` is missing**, so
  `th.json` must be updated manually. New keys are written as the key itself
  for `en` and `"__NOT_TRANSLATED__"` elsewhere (`:21-28`);
  `removeUnusedKeys: false` (`:12`).
- **CI gates:** `.github/workflows/terminology-content.yml:88-89` runs
  `node scripts/check-terminology-i18n.mjs --strict` on changes to
  `resources/i18n/**`, `packages/backend.ai-ui/src/locale/**` and
  `terminology.json` — it fails on a forbidden `avoid[]` term in any i18n
  **value** (never a key), and is absolute rather than diff-aware
  (`:10-40`). There is **no key-parity or translation-completeness gate**.
  Keys must stay alphabetically sorted (`format-fix:i18n` runs
  `prettier` with `prettier-plugin-sort-json`); a merge driver exists at
  `scripts/i18n-merge-driver.js`.
- **Expect a `searchIndex.json` diff.** A new `t()` key used in a routed module
  regenerates `react/src/generated/searchIndex.json`; never hand-merge it —
  `.claude/rules/search-index-conflicts.md:20-29`.

---

## 6. Recommendations for the prototype

1. **Call the endpoint through `baiSignedRequestWithPromise<ScanImageResponse>`
   inside a `useTanMutation`**, copying
   `react/src/components/ImportFromHuggingFaceModal.tsx:185-201`. Do not add a
   method to `backend.ai-client` — `@ts-nocheck` on every resource file
   (`resources/container-image.ts:1`) would throw away the response type that
   is the point of the exercise.
2. **Declare the response type locally** (§1.4) and read only
   `item.name`, `item.tag`, `item.architecture`, `item.registry`,
   `item.project`. Treat `errors[]` as advisory — it is empty on every current
   code path.
3. **Classify on `err.error_code` / `err.statusCode`**, following
   `react/src/pages/SessionLauncherPage.tsx:572-584`, and render the message
   through `usePainKiller().relieve(err.title)`. Assume a 500 with no body is
   the "tag not found" case until the prerequisite fix lands, and say so in the
   copy rather than showing a raw stack.
4. **Do the unknown-registry check client-side, before submitting.** The
   manager cannot distinguish it (§1.5), and the modal needs the parsed
   registry/project anyway to pre-fill the nested Add-registry modal.
5. **Gate with `baiClient.is_superadmin && baiClient.supports('scan-image-by-canonical')`,
   hiding the button.** The Images tab is admin-scoped, not superadmin-scoped
   (`react/src/routes.tsx:783-787`), so the role check cannot be inherited from
   the route.
6. **Put the button in the list's action row**
   (`react/src/components/ImageList.tsx:593-608`), beside "Install image" —
   not in the page `BAICard`'s empty `extra` slot. This matches the Registries
   tab (`ContainerRegistryList.tsx:473-480`) and is what the map means by
   "Images tab header".
7. **Nesting the Add-registry modal is safe and precedented** (§3.5, §3.6) —
   `dialogLevelStack` inerts the covered modal, Escape closes only the top one,
   and `BAIDialog.test.tsx:217-250` tests exactly this shape. Wrap the inner
   modal in `BAIUnmountAfterClose`, as `ImageList.tsx:699` already does for
   `ImageInstallModal`.
8. **But budget for two small changes to `ContainerRegistryEditorModal`**
   (§3.2, §3.3): a new `initialValues` prop for create mode (the fragment prop
   cannot carry it and would flip the modal into modify mode), and either a
   widened create-mutation selection set or an outer-modal refetch-and-match on
   `onOk('create')`. Neither is in the map's Notes.
9. **Refetch with `updateFetchKey()` on close**, copying
   `react/src/components/ImageList.tsx:672-678`. Nothing filters the list by
   installed state, so the new image will appear — but it lands wherever the
   manager's default ordering puts it and may be off page 1
   (§4.3, §4.4). The map already rules out a row highlight; a toast naming the
   added canonical is the practical substitute.
10. **New keys go in `resources/i18n/en.json` under `environment.*`**,
    PascalCase leaves, reusing `button.*` for the footer and `registry.*` for
    the nested form's fields. `environment.AddImage` is unclaimed. Avoid
    "Modify"/"Update" in any new string (`terminology.json:904`). Run
    `make i18n` to fan the keys out, then add `th.json` by hand.
11. **Flag for the spec, not the prototype:** a registered-but-uninstalled
    image renders with an entirely empty Status cell
    (`react/src/components/ImageList.tsx:315`). Decide whether "Registered"
    deserves a label of its own.

---

## 7. What contradicts or sharpens the map's Notes

1. **A REST wrapper is not the right shape.** The map records that
   "`backend.ai-client` has no wrapper for `/admin/images/rescan` yet" — true,
   and there is no `/admin` REST precedent in the client at all
   (`packages/backend.ai-client/src/client.ts:1877` is the only `/admin` path).
   But the conclusion should be *don't add one*: every resource file is
   `@ts-nocheck`, and the live precedent for a modal issuing a REST POST is
   `react/src/components/ImportFromHuggingFaceModal.tsx:185-201`. §1.3.
2. **A nested-modal precedent already exists — many of them.** The map presents
   the nested Add-registry modal as the driver's choice between two options.
   It is in fact the established pattern: `dialogLevelStack`
   (`packages/backend.ai-ui/src/components/dialogLevelStack.ts:5-7`) exists for
   it, `BAIDialog.test.tsx:217-250` tests a `BAIDialog` inside a `BAIDialog`,
   and a dozen shipped modals do it (§3.6). No risk to retire here.
3. **"Pre-filled from the parsed prefix" is not possible today.**
   `ContainerRegistryEditorModal`'s only data prop is a Relay fragment key, and
   a truthy value switches the modal into *modify* mode
   (`react/src/components/ContainerRegistryEditorModal.tsx:47`, `:277-296`,
   `:321`, `:176-203`). Its `onOk(type)` also returns no registry identity
   (`:46`), and the create mutation selects `id` only (`:96`). The map's
   baseline decision needs a small component change attached to it. §3.2, §3.3.

Two smaller sharpenings worth carrying into the spec:

- The map's "Images tab header, beside Install image" resolves to the **list's
  in-body action row** (`react/src/components/ImageList.tsx:593-608`), not the
  page card's `extra` slot, which is empty
  (`react/src/pages/EnvironmentPage.tsx:62-73`). §4.6.
- `terminology.json` **does not constrain** "Add" vs "Install"; it does forbid
  "Modify"/"Update" (`:904`). The map lists the terminology question as open —
  it stays open, but the constraint set is now known. §5.5.

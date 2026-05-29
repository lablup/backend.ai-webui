# `backend.ai-client` Type Follow-ups

This file collects type-related TODOs found while replacing the blanket
`: any` annotations that PR #7495 (FR-2927) inserted in `client.ts` when
the package was switched to `strict: true`. Each item documents a place
where the *current runtime behavior was preserved* but the type system
could not be tightened without changing what the code does. These are
candidates for follow-up PRs.

## 1. `_wrapWithPromise` mutates `Response.status` / `Response.statusText`

**Where:** `src/client.ts` — `_wrapWithPromise` catch block (`Client.ERR_ABORT`,
`Client.ERR_TIMEOUT`, and the `default:` arm).

**Symptom:** The catch block assigns to `resp.status` and `resp.statusText`,
yet on the success path `resp` is a `Response` instance whose `status` and
`statusText` are read-only at runtime. The assignments are silently no-ops
unless `resp` was previously replaced with `{} as Response` (the
"`fetch never ran`" branch). The current PR pretends the variable is a
loose overlay via `respOverlay = resp as unknown as { status?, statusText?, msg? }`,
which compiles but does not change the underlying bug.

**Suggested follow-up:** Introduce a small `ErrorOverlay` object that
tracks the synthetic status/statusText/msg fields separately from the
real `Response`, and consume it from the thrown `WrappedError` payload.
The thrown shape becomes the single source of truth for these fields.

## 2. `_wrapWithPromise` `body` is polymorphic

**Where:** `src/client.ts:229` — `let body: any;`

**Symptom:** `body` is alternately the JSON object returned by
`resp.json()`, the string from `resp.text()`, or the `Blob` from
`resp.blob()`. Several lines after the content-type branch read
`body.title`, `body.type`, `body.error_code`, etc., without first
checking which path was taken. A narrower type that matches the actual
JSON shape would require splitting `body` into per-branch locals.

**Suggested follow-up:** Refactor `_wrapWithPromise` so that each
content-type branch declares its own typed local (`jsonBody`,
`textBody`, `blobBody`). Then express the catch-block reads in terms
of `jsonBody` only, where the shape is known.

## 3. `current_log.statusCode` is `number | string`

**Where:** `src/client.ts` — the second `if (typeof resp === 'undefined') { resp = ... }`
block before `current_log` is built.

**Symptom:** When no response exists, the code overlays
`{ status: 'No status', statusText: 'No response given.' }` onto `resp`.
So `current_log.statusCode` carries a string in that case and a number
otherwise. The log payload is written to `localStorage`, then later
`JSON.parse`-d and processed. Downstream readers (if any) must accept
both shapes.

**Suggested follow-up:** Use `0` or `-1` as a sentinel number instead
of the literal `'No status'` string. Then `statusCode: number` becomes
honest and downstream parsers can rely on it.

## 4. `ClientConfig._session_id` is dead-write only

**Where:** `src/client.ts:864` (formerly 858) — `this._config._session_id = result.session_id;`

**Symptom:** `check_login()` writes a `_session_id` field on
`ClientConfig` after a successful login. No code in this package, in
`react/src`, or in `packages/backend.ai-ui/src` reads it. The TODO
comment at the call site says `X-BackendAI-SessionID` (already in use
via `Client._loginSessionId`) supersedes this field.

**Suggested follow-up:** Delete the `_session_id` write and the
optional `_session_id?: string` field from `ClientConfig`. Verify no
external consumers depend on it (the dist `.d.ts` exposes
`ClientConfig`, so a major-version bump may be appropriate).

## 5. `download()` array-as-URL-search-param relies on coercion

**Where:** `src/client.ts` — `Client.download(sessionId, files)`.

**Symptom:** `new URLSearchParams({ files: string[] })` is not legal
under strict TS because the constructor accepts `Record<string, string>`,
not `string[]`. The current code casts via
`as unknown as Record<string, string>` so that
`URLSearchParams` coerces the array to a comma-joined string
("files=a,b"). The original `any` typing hid this. The backend handler
needs to accept a comma-separated list; the more REST-idiomatic
encoding would be repeated keys (`files=a&files=b`).

**Suggested follow-up:** Confirm with the manager team what
`/folders/.../download` actually parses; if it accepts repeated keys,
switch to `files.flatMap(f => [['files', f]])` and drop the cast.
Otherwise, document the comma-joined encoding here.

## 6. `query()` return is generic but defaults to `unknown`

**Where:** `src/client.ts` — `Client.query<TData = unknown>(...)`.

**Symptom:** Callers that don't supply `TData` now receive `unknown`,
which is stricter than the previous `any`. Most callers in `react/src`
destructure the response immediately (`(await client.query(...)).user`),
which would now require an `as` cast or a generic argument.

**Suggested follow-up:** Migrate the high-traffic callers to supply
`TData` based on the Relay-generated GraphQL response types (e.g.
`Client.query<UserListQuery$data>(query, vars)`). Until then, callers
that fail to compile can add `as any` at the call site — log them in
this file as they appear.

## 7. `resources/*.ts` 25 files still carry `// @ts-nocheck`

**Where:** `src/resources/agent.ts`, `cloud.ts`, `compute-session.ts`,
`container-image.ts`, `domain.ts`, `edu-app.ts`, `enterprise.ts`,
`group.ts`, `keypair.ts`, `maintenance.ts`, `model-service.ts`,
`pipeline.ts`, `registry.ts`, `resource-policy.ts`, `resource-preset.ts`,
`resources.ts`, `scaling-group.ts`, `service.ts`, `session-template.ts`,
`setting.ts`, `storage-proxy.ts`, `user-config.ts`, `user.ts`, `utils.ts`,
`vfolder.ts`.

**Symptom:** All 25 resource modules begin with `// @ts-nocheck`, so the
new `strict: true` tsconfig has no effect on them. The class-field
declarations inside (`public client: any; public name: any; public id: any;
public urlPrefix: any;`) are not the only `any`s in these files — every
method parameter is untyped because the file is excluded from checking.

**Suggested follow-up:** Remove `// @ts-nocheck` one file at a time,
fix the resulting strict-mode errors using the GraphQL schema
(`data/schema.graphql`) and the Backend.AI server Pydantic DTOs at
`/Workspace/backend.ai/src/ai/backend/common/dto/manager/` as the
sources of truth. Recommended order (least → most coupled):

1. `utils.ts`, `cloud.ts`, `enterprise.ts`, `edu-app.ts`, `setting.ts`,
   `user-config.ts`, `registry.ts`, `maintenance.ts`, `scaling-group.ts`
2. `domain.ts`, `group.ts`, `resource-policy.ts`, `resource-preset.ts`,
   `agent.ts`, `keypair.ts`, `user.ts`, `storage-proxy.ts`
3. `container-image.ts`, `session-template.ts`, `service.ts`,
   `model-service.ts`, `pipeline.ts`, `compute-session.ts`, `resources.ts`
4. `vfolder.ts` (largest surface area; do last)

The expected diff size per file is 5–20 type annotations plus an
`import type { Client } from '../client';` to break the circular
import (type-only imports are safe).

## 8. `Client.ERR_*` enumerability — RESOLVED in this PR

**Where:** `src/client.ts` class body + bottom-of-file
`Object.defineProperty` block.

**Resolution:** This PR initially replaced the
`Object.defineProperty(Client, 'ERR_SERVER', { value: 0, enumerable: true, ... })`
block with `static readonly ERR_SERVER = 0 as const;` only. That changed
the property descriptor (`enumerable: true → false`), which is a subtle
behavior change for any consumer that introspected the constructor via
`Object.keys(Client)` / `for (const k in Client)`.

After Copilot review feedback, the `Object.defineProperty` calls were
**re-added** under the class body. The `static readonly … as const`
declarations remain inside the class so TypeScript can narrow the
sentinels as literal types, and the explicit `defineProperty` calls
restore the original descriptors at runtime. Behavior is now identical
to the pre-PR-#7495 state.

## 10. `_apiVersion[1]` only handles single-digit major versions

**Where:** `src/client.ts` — `newSignedRequest`:

```ts
if (Number(this._config._apiVersion[1]) < 4) { ... }
```

**Symptom:** `_apiVersion` is shaped like `'v8.20240915'`; index `[1]`
reads the leading character of the major version. For a future
`v10.…` manager response, `_apiVersion[1]` is `'1'`, so the comparison
selects the V3/V4 authentication-string branch instead of the modern
one. This bug pre-existed PR #7495 (the original code did the same
implicit coercion); this PR preserved the bug verbatim, only adding
`Number()` to make strict TS accept it.

**Suggested follow-up:** Replace the indexing with
`Number(this._config._apiVersionMajor)` (or parse `_apiVersion` with
a regex `^v(\d+)\.`). Either form correctly handles two-digit
majors. Verify the manager team's version-tagging plan first — if
they intentionally never cross v9, this fix is purely defensive.

## 9. `body` in `newSignedRequest` may carry a `node form-data` instance

**Where:** `src/client.ts` — `newSignedRequest` body branch:

```ts
typeof (body as { getBoundary?: () => string }).getBoundary === 'function' ||
body instanceof FormData
```

**Symptom:** The first arm of the `||` exists to handle the node
`form-data` package, whose instances do not inherit from the DOM
`FormData`. WebUI runs in the browser today, so this branch is
practically dead. Still, removing it would change behavior in any
environment that imports this package from Node directly.

**Suggested follow-up:** Confirm no Node consumer is left (Electron
main process and `src/lib/backend.ai-client-node.ts` are the candidates).
If safe, drop the `getBoundary` branch and tighten `body` to
`Record<string, unknown> | FormData | Uint8Array | string | null`.

/*
Backend.AI API Library / SDK for Node.JS / Javascript ESModule
==============================================================

(C) Copyright 2016-2026 Lablup Inc.
Licensed under LGPL-3.0-or-later
*/

export interface SessionResources {
  group_name?: string;
  domain?: string;
  type?: 'interactive' | 'batch' | 'inference' | 'system';
  cluster_mode: 'single-node' | 'multi-node';
  cluster_size: number;
  maxWaitSeconds: number;
  starts_at?: string;
  startupCommand?: string;
  bootstrap_script?: string;
  owner_access_key?: string;
  reuseIfExists?: boolean;
  /** Free-form session tag (Backend.AI session `tag` attribute). */
  tag?: string;
  dependencies?: string[];
  config?: {
    resources?: {
      cpu: number;
      mem: string;
      [key: string]: number | string;
    };
    resource_opts?: {
      shmem?: string;
      allow_fractional_resource_fragmentation?: boolean;
    };
    mounts?: string[];
    mount_ids?: string[];
    mount_map?: {
      [key: string]: string;
    };
    environ?: {
      [key: string]: string;
    };
    scaling_group?: string;
    preopen_ports?: number[];
    agent_list?: string[];
  };
}

/**
 * Body shapes accepted by `Client.newSignedRequest()` / `newPublicRequest()`.
 * The serializer treats `null`/`undefined` as an empty body, passes a
 * `FormData` instance through unchanged (multipart), and JSON-stringifies
 * everything else. Therefore the supported shapes are restricted to:
 *
 * - `null` / `undefined` — GET or empty body.
 * - `FormData` — multipart upload (e.g. VFolder upload).
 * - `Record<string, unknown>` — any JSON-serializable object.
 *
 * Pre-serialized strings and binary payloads (`Uint8Array`) are NOT
 * passed through as-is — they would be JSON-stringified, which is
 * almost certainly not the caller's intent. Use `FormData` for binary.
 */
export type RequestBody = Record<string, unknown> | FormData | null | undefined;

/**
 * Description of an HTTP request after the Client has serialized the body
 * (either via JSON.stringify or by accepting a FormData / Uint8Array as-is).
 * `body` must already be a `BodyInit` so that `fetch(rqst.uri, rqst)` is
 * legal — higher-level method parameters should use `RequestBody` instead
 * and let `newSignedRequest` perform the serialization.
 */
export type requestInfo = {
  method: string;
  headers: Headers;
  mode?: RequestMode | undefined;
  body?: BodyInit | null;
  cache?: RequestCache | undefined;
  uri: string;
  credentials?: RequestCredentials | undefined;
  signal?: AbortController['signal'] | undefined;
};

/**
 * Numeric sentinel values for `Client.ERR_*` static constants.
 * Must stay in lockstep with the values written in `client.ts`.
 */
export type ErrorTypeCode = 0 | 1 | 2 | 3 | 4 | 99;

/**
 * The error object shape thrown by `Client._wrapWithPromise` when a request
 * fails (network error, non-2xx response, abort, timeout). Catch sites
 * (across `react/src` and `packages/backend.ai-ui/src`) typically read
 * `type`, `title`, `description`, `status`, `message`.
 */
export interface WrappedError {
  type: string;
  title?: string;
  description?: string;
  status?: number;
  statusText?: string;
  message?: string;
  // Some throw sites also forward the original Response body for inspection.
  [extra: string]: unknown;
}

/**
 * The "envelope" shape that the WebUI web proxy wraps around a failed
 * login response so the SDK can surface a structured error. See
 * `client.ts:loginWithCredentials` for the recovery path.
 */
export interface LoginEnvelope {
  authenticated: false;
  data: {
    type: string;
    title?: string;
    details?: string;
  };
}

/**
 * Feature-flag map populated by `Client._updateSupportList`. Values are
 * booleans for capability presence; the actual key set is server-version
 * dependent.
 */
export type FeatureSet = Record<string, boolean>;

/**
 * Variables object passed as the `variables` field of a GraphQL request.
 * Values can be any JSON-serializable shape.
 */
export type GraphQLVariables = Record<string, unknown>;

/**
 * Standard GraphQL response envelope returned by `/admin/gql`. The shape
 * is unchanged between Backend.AI manager versions.
 */
export interface GraphQLResponse<TData = unknown> {
  data: TData;
  errors?: Array<{
    message: string;
    path?: Array<string | number>;
    locations?: Array<{ line: number; column: number }>;
    extensions?: Record<string, unknown>;
  }>;
}

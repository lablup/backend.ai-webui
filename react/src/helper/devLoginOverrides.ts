/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * Dev-only login overrides read from Vite env vars.
 *
 * These let a local dev session pre-fill the login screen so you don't retype
 * the endpoint/credentials on every cold start. The dev-server skill derives
 * `VITE_DEFAULT_API_ENDPOINT` from the current branch's PR description; see
 * `.claude/skills/dev-server/SKILL.md`.
 *
 * All three are `undefined` in production builds: `import.meta.env.DEV` is
 * statically replaced with `false` by Vite, so every branch here (and every
 * consumer's `if (devXxxOverride)` guard) is dead-code eliminated. The feature
 * therefore never ships in a production bundle.
 *
 * SECURITY: `VITE_DEFAULT_PASSWORD` bakes a plaintext password into the dev
 * bundle at build time. Only ever set these in a git-ignored
 * `.env.development.local` or the shell — never in `config.toml`, a committed
 * `.env`, or any deployed environment.
 */

/**
 * Full API endpoint URL to pre-fill on the login screen (dev only).
 * Trailing slashes are stripped so it compares cleanly against the endpoint
 * the client actually connects to.
 */
export const devApiEndpointOverride: string | undefined =
  import.meta.env.DEV &&
  typeof import.meta.env.VITE_DEFAULT_API_ENDPOINT === 'string' &&
  import.meta.env.VITE_DEFAULT_API_ENDPOINT.trim() !== ''
    ? import.meta.env.VITE_DEFAULT_API_ENDPOINT.trim().replace(/\/+$/, '')
    : undefined;

/** SESSION-mode email/username to pre-fill on the login screen (dev only). */
export const devEmailOverride: string | undefined =
  import.meta.env.DEV &&
  typeof import.meta.env.VITE_DEFAULT_EMAIL === 'string' &&
  import.meta.env.VITE_DEFAULT_EMAIL.trim() !== ''
    ? import.meta.env.VITE_DEFAULT_EMAIL.trim()
    : undefined;

/**
 * SESSION-mode password to pre-fill on the login screen (dev only).
 * Intentionally not trimmed — a password may contain significant whitespace.
 */
export const devPasswordOverride: string | undefined =
  import.meta.env.DEV &&
  typeof import.meta.env.VITE_DEFAULT_PASSWORD === 'string' &&
  import.meta.env.VITE_DEFAULT_PASSWORD !== ''
    ? import.meta.env.VITE_DEFAULT_PASSWORD
    : undefined;

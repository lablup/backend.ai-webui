/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
*/
import { useEventNotStable } from './useEventNotStable';
import { useRef, useState } from 'react';

export type BAIInteractiveLoginFailureReason =
  | 'no_endpoint'
  | 'invalid_callback'
  | 'cors_or_mixed'
  | 'timeout'
  | 'http_error'
  | 'invalid_response'
  | 'no_session'
  | 'no_session_id'
  | 'relay_failed';

export interface BAIInteractiveLoginFailure {
  reason: BAIInteractiveLoginFailureReason;
  status?: number;
}

export type BAIInteractiveLoginProbeResult =
  | { ok: true; sessionId: string }
  | ({ ok: false } & BAIInteractiveLoginFailure);

export const BAI_INTERACTIVE_LOGIN_DEFAULT_TIMEOUT_MS = 10_000;

const LOGIN_CHECK_PATH = 'server/login-check';
const INTERACTIVE_LOGIN_PATH = 'interactive-login';

/**
 * Returns the webserver base as an absolute URL whose path ends with `/`, so a
 * webserver mounted under a path prefix (`https://host/bai/`) keeps that prefix
 * when relative segments are resolved against it. `null` means the caller has
 * no usable endpoint (`no_endpoint`).
 */
export const normalizeWebserverUrl = (
  raw: string | null | undefined,
): string | null => {
  const trimmed = raw?.trim();
  if (!trimmed) return null;
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }
  // `host:port` parses as an opaque-path URL whose scheme is the host, and
  // resolving a relative segment against such a base throws.
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
  if (!url.pathname.endsWith('/')) {
    url.pathname = `${url.pathname}/`;
  }
  url.search = '';
  url.hash = '';
  return url.toString();
};

/**
 * The provider page navigates to the callback with a bare
 * `window.location.href = callback`, so only an absolute http(s) URL is ever
 * forwarded — a `javascript:` or `data:` value would execute there.
 */
export const resolveCallbackUrl = (
  callbackUrl: string | null | undefined,
  documentUrl: string | null | undefined = globalThis.location?.href,
): string | null => {
  const raw = callbackUrl?.trim() || documentUrl?.trim();
  if (!raw) return null;
  let url: URL;
  try {
    url = documentUrl ? new URL(raw, documentUrl) : new URL(raw);
  } catch {
    return null;
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
  return url.toString();
};

export interface BuildInteractiveLoginUrlOptions {
  webserverUrl: string;
  appName: string;
  callbackUrl?: string;
}

/**
 * `<webserver>/interactive-login?name=…&callback=…`, or `null` when either
 * the webserver URL or the callback is unusable (see `resolveCallbackUrl`).
 */
export const buildInteractiveLoginUrl = ({
  webserverUrl,
  appName,
  callbackUrl,
}: BuildInteractiveLoginUrlOptions): string | null => {
  const base = normalizeWebserverUrl(webserverUrl);
  if (!base) return null;
  const callback = resolveCallbackUrl(callbackUrl);
  if (!callback) return null;
  const url = new URL(INTERACTIVE_LOGIN_PATH, base);
  url.searchParams.set('name', appName);
  url.searchParams.set('callback', callback);
  return url.toString();
};

export const classifyFetchError = (
  error: unknown,
): Extract<BAIInteractiveLoginFailureReason, 'timeout' | 'cors_or_mixed'> => {
  const name = (error as { name?: string } | null)?.name;
  return name === 'TimeoutError' || name === 'AbortError'
    ? 'timeout'
    : 'cors_or_mixed';
};

/**
 * The webserver answers `{ authenticated, data, session_id }`; only
 * `authenticated` and `session_id` are read.
 */
export const classifyLoginCheckResponse = (
  body: unknown,
): BAIInteractiveLoginProbeResult => {
  if (typeof body !== 'object' || body === null) {
    return { ok: false, reason: 'invalid_response' };
  }
  const { authenticated, session_id: sessionId } = body as {
    authenticated?: unknown;
    session_id?: unknown;
  };
  if (typeof authenticated !== 'boolean') {
    return { ok: false, reason: 'invalid_response' };
  }
  if (!authenticated) {
    return { ok: false, reason: 'no_session' };
  }
  if (typeof sessionId !== 'string' || sessionId.length === 0) {
    return { ok: false, reason: 'no_session_id' };
  }
  return { ok: true, sessionId };
};

export interface ProbeLoginCheckOptions {
  webserverUrl: string;
  timeoutMs?: number;
}

export const probeLoginCheck = async ({
  webserverUrl,
  timeoutMs = BAI_INTERACTIVE_LOGIN_DEFAULT_TIMEOUT_MS,
}: ProbeLoginCheckOptions): Promise<BAIInteractiveLoginProbeResult> => {
  const base = normalizeWebserverUrl(webserverUrl);
  if (!base) return { ok: false, reason: 'no_endpoint' };

  let response: Response;
  try {
    // No body and no Content-Type: the handler reads neither, and either one
    // would turn this into a preflighted cross-origin request.
    response = await fetch(new URL(LOGIN_CHECK_PATH, base).toString(), {
      method: 'POST',
      credentials: 'include',
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    return { ok: false, reason: classifyFetchError(error) };
  }

  if (!response.ok) {
    return { ok: false, reason: 'http_error', status: response.status };
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch (error) {
    // The timeout signal also governs reading the body.
    return {
      ok: false,
      reason:
        classifyFetchError(error) === 'timeout'
          ? 'timeout'
          : 'invalid_response',
    };
  }
  return classifyLoginCheckResponse(body);
};

export interface UseBAIInteractiveLoginOptions {
  webserverUrl: string;
  appName: string;
  callbackUrl?: string;
  timeoutMs?: number;
}

export interface UseBAIInteractiveLoginResult {
  probe: () => Promise<BAIInteractiveLoginProbeResult>;
  /** Navigates away, or returns the reason it could not. */
  redirectToInteractiveLogin: () => BAIInteractiveLoginFailureReason | null;
  reportFailure: (
    reason: BAIInteractiveLoginFailureReason,
    status?: number,
  ) => void;
  isProbing: boolean;
  failure: BAIInteractiveLoginFailure | null;
  interactiveLoginUrl: string | null;
}

const useBAIInteractiveLogin = ({
  webserverUrl,
  appName,
  callbackUrl,
  timeoutMs = BAI_INTERACTIVE_LOGIN_DEFAULT_TIMEOUT_MS,
}: UseBAIInteractiveLoginOptions): UseBAIInteractiveLoginResult => {
  'use memo';
  const [isProbing, setIsProbing] = useState(false);
  const [failure, setFailure] = useState<BAIInteractiveLoginFailure | null>(
    null,
  );
  // Only the latest probe commits state; an earlier one that settles later
  // (StrictMode's replayed mount, a re-probe) is discarded.
  const probeSequenceRef = useRef(0);

  const probe = useEventNotStable(async () => {
    const sequence = ++probeSequenceRef.current;
    setIsProbing(true);
    setFailure(null);
    const result = await probeLoginCheck({ webserverUrl, timeoutMs });
    if (sequence === probeSequenceRef.current) {
      setFailure(
        result.ok ? null : { reason: result.reason, status: result.status },
      );
      setIsProbing(false);
    }
    return result;
  });

  const reportFailure = useEventNotStable(
    (reason: BAIInteractiveLoginFailureReason, status?: number) => {
      setFailure({ reason, status });
    },
  );

  const redirectToInteractiveLogin = useEventNotStable(() => {
    const url = buildInteractiveLoginUrl({
      webserverUrl,
      appName,
      callbackUrl,
    });
    if (!url) {
      const reason = normalizeWebserverUrl(webserverUrl)
        ? 'invalid_callback'
        : 'no_endpoint';
      setFailure({ reason });
      return reason;
    }
    globalThis.location.href = url;
    return null;
  });

  return {
    probe,
    redirectToInteractiveLogin,
    reportFailure,
    isProbing,
    failure,
    interactiveLoginUrl: buildInteractiveLoginUrl({
      webserverUrl,
      appName,
      callbackUrl,
    }),
  };
};

export default useBAIInteractiveLogin;

/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
*/
import { useEventNotStable } from './useEventNotStable';
import { useState } from 'react';

export type BAIInteractiveLoginFailureReason =
  | 'no_endpoint'
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

export interface BuildInteractiveLoginUrlOptions {
  webserverUrl: string;
  appName: string;
  callbackUrl?: string;
}

/**
 * `<webserver>/interactive-login?name=…&callback=…`. The callback is always
 * absolute — the provider page reads it with `new URL(callback).origin`, which
 * throws on a relative value.
 */
export const buildInteractiveLoginUrl = ({
  webserverUrl,
  appName,
  callbackUrl,
}: BuildInteractiveLoginUrlOptions): string | null => {
  const base = normalizeWebserverUrl(webserverUrl);
  if (!base) return null;
  const here = globalThis.location?.href;
  const callback = new URL(
    callbackUrl ?? here ?? base,
    here ?? base,
  ).toString();
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

  try {
    return classifyLoginCheckResponse(await response.json());
  } catch {
    return { ok: false, reason: 'invalid_response' };
  }
};

export interface UseBAIInteractiveLoginOptions {
  webserverUrl: string;
  appName: string;
  callbackUrl?: string;
  timeoutMs?: number;
}

export interface UseBAIInteractiveLoginResult {
  probe: () => Promise<BAIInteractiveLoginProbeResult>;
  redirectToInteractiveLogin: () => void;
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

  const probe = useEventNotStable(async () => {
    setIsProbing(true);
    setFailure(null);
    try {
      const result = await probeLoginCheck({ webserverUrl, timeoutMs });
      setFailure(
        result.ok ? null : { reason: result.reason, status: result.status },
      );
      return result;
    } finally {
      setIsProbing(false);
    }
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
      setFailure({ reason: 'no_endpoint' });
      return;
    }
    globalThis.location.href = url;
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

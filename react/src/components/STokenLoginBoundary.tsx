/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 IMPORTANT — URL-API prohibition invariant (spec FR-2616 acceptance):
 This file and any module imported from it MUST NOT reference
 `window.location`, `window.history`, `document.location`, or
 `URLSearchParams`. The `sToken` value is supplied by callers via prop
 (sourced through `useSToken` or equivalent nuqs-based hook). See
 `.specs/draft-stoken-login-boundary/spec.md` section
 "URL 파라미터 파싱 규약 (nuqs)". A static assertion in the accompanying
 unit test (`STokenLoginBoundary.test.tsx`) enforces this in CI.
 */
import {
  connectViaGQL,
  createBackendAIClient,
  tokenLogin,
} from '../helper/loginSessionAuth';
import { useResolvedApiEndpoint } from '../hooks/useResolvedApiEndpoint';
import { loginConfigState } from '../hooks/useWebUIConfig';
import { jotaiStore } from './DefaultProviders';
import { App, Spin, Typography } from 'antd';
import { BAIButton, BAICard, BAIFlex, useBAILogger } from 'backend.ai-ui';
import { useAtomValue } from 'jotai';
import {
  Suspense,
  useCallback,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Error classification surfaced by `STokenLoginBoundary`. Callers receive
 * this via `onError`; the default error card branches on `kind` to render a
 * classification-specific message.
 */
export type STokenLoginError =
  | { kind: 'missing-token' }
  | { kind: 'endpoint-unresolved'; cause?: unknown }
  | { kind: 'server-unreachable'; cause: unknown }
  | { kind: 'token-invalid'; cause: unknown }
  | { kind: 'concurrent-session'; cause: unknown }
  | { kind: 'unknown'; cause: unknown };

export interface STokenLoginBoundaryProps {
  /**
   * Canonical sToken value sourced by the caller via nuqs. Required — the
   * boundary does not read URL state on its own. Pass an empty string when
   * the caller intends to surface `missing-token`; usually callers should
   * conditionally mount the boundary only when a token is present (see
   * spec scenario A for LoginView).
   */
  sToken: string;
  children: ReactNode;
  /**
   * Additional parameters forwarded to `client.token_login(sToken, extraParams)`
   * verbatim. Used by EduAppLauncher to pass `app`, `session_id`, resource
   * hints, etc. Callers collect these via nuqs and pass a plain object.
   */
  extraParams?: Record<string, string>;
  /**
   * Invoked after successful authentication with the connected client. This
   * is where callers perform their own post-setup work: panel close,
   * last_login counters, URL cleanup via the `clear` tuple returned from
   * `useSToken`, etc.
   */
  onSuccess?: (client: unknown) => void;
  /**
   * Invoked whenever the state machine transitions to an error state. The
   * error is also surfaced in the default error card unless `errorFallback`
   * is provided.
   */
  onError?: (error: STokenLoginError) => void;
  /**
   * Rendered while the authentication sequence is in progress (endpoint
   * resolve → ping → token_login → GQL connect). Defaults to a simple
   * connection indicator card.
   */
  fallback?: ReactNode;
  /**
   * When provided, replaces the built-in error card for every error kind
   * (Q4 — errorFallback wins). Receives the current error and a `retry`
   * callback that restarts the sequence from the idle state.
   */
  errorFallback?: (error: STokenLoginError, retry: () => void) => ReactNode;
}

type Phase =
  | { name: 'pending' }
  | { name: 'success' }
  | { name: 'error'; error: STokenLoginError };

/**
 * sToken-based login boundary. Authenticates via `client.token_login` using
 * the caller-supplied `sToken`, dispatches `backend-ai-connected` exactly
 * once on success, and only then renders `children`. See spec section
 * "컴포넌트 설계" and "내부 동작 시퀀스" for the full contract.
 */
export const STokenLoginBoundary: React.FC<STokenLoginBoundaryProps> = (
  props,
) => {
  return (
    <Suspense fallback={props.fallback ?? <DefaultFallback />}>
      <STokenLoginBoundaryInner {...props} />
    </Suspense>
  );
};

const STokenLoginBoundaryInner: React.FC<STokenLoginBoundaryProps> = ({
  sToken,
  children,
  extraParams,
  onSuccess,
  onError,
  fallback,
  errorFallback,
}) => {
  'use memo';
  const { logger } = useBAILogger();
  const apiEndpoint = useResolvedApiEndpoint();
  const loginConfig = useAtomValue(loginConfigState);

  const [phase, setPhase] = useState<Phase>({ name: 'pending' });
  const [retryKey, setRetryKey] = useState(0);

  // Guard against React StrictMode's dev double-invoke of effects. Once the
  // sequence has started for a given retryKey, a second fire is ignored.
  const startedForKeyRef = useRef<number | null>(null);
  // Guard against duplicate `backend-ai-connected` dispatch across the
  // component lifetime, including after retries. The event is broadcast at
  // most once per successful login; downstream subscribers (Relay, plugin
  // endpoint wiring) assume idempotency does not hold for them.
  const eventDispatchedRef = useRef(false);

  const surfaceError = useEffectEvent((error: STokenLoginError) => {
    setPhase({ name: 'error', error });
    onError?.(error);
  });

  const runLoginSequence = useEffectEvent(async () => {
    if (!apiEndpoint) {
      surfaceError({ kind: 'endpoint-unresolved' });
      return;
    }

    // Defensive cookie set when a token is present. Primary auth reads
    // the token from the JSON body, but manager-side hooks (e.g. OpenID)
    // fall back to the cookie. Always encode — JWT-shaped tokens are
    // `encodeURIComponent`-invariant in practice; see FR-2635.
    if (sToken) {
      document.cookie = `sToken=${encodeURIComponent(sToken)}; path=/; Secure; SameSite=Lax`;
    }

    const { client } = createBackendAIClient('', '', apiEndpoint, 'SESSION');

    try {
      await client.get_manager_version();
    } catch (cause) {
      logger.error('[STokenLoginBoundary] server unreachable', cause);
      surfaceError({ kind: 'server-unreachable', cause });
      return;
    }

    // Idempotency / cookie-session fast-path: if the browser already
    // holds a valid session (from a prior login in the same browser), we
    // skip `token_login` entirely. This also covers the case where a
    // caller mounts the boundary without a URL token — an existing
    // session alone is enough to reach the success state.
    let alreadyLoggedIn = false;
    try {
      alreadyLoggedIn = !!(await client.check_login());
    } catch {
      alreadyLoggedIn = false;
    }

    // Only after the session check do we surface `missing-token`: a bare
    // `?sToken=` URL with no cookie session still fails, but a session
    // cookie alone (no sToken in the URL) proceeds through the GQL wiring.
    if (!alreadyLoggedIn && !sToken) {
      surfaceError({ kind: 'missing-token' });
      return;
    }

    // Prefer the live atom state; fall back to an empty-object shape that
    // `tokenLogin`/`connectViaGQL` tolerate. `loadConfigFromWebServer` is
    // intentionally NOT invoked here — see spec Q2.
    const cfg =
      loginConfig ?? jotaiStore.get(loginConfigState) ?? ({} as never);
    const endpoints =
      ((
        globalThis as { backendaioptions?: { get: (k: string) => unknown } }
      ).backendaioptions?.get('endpoints') as string[] | undefined) ?? [];

    try {
      if (alreadyLoggedIn) {
        // Session already exists — wire up the GraphQL client / groups /
        // endpoint history the same way `tokenLogin` would, without
        // re-authenticating. `backend-ai-connected` is still dispatched
        // below so Relay and plugin subscribers unblock even on this
        // fast-path.
        await connectViaGQL(client, cfg, endpoints);
      } else {
        await tokenLogin(client, sToken!, cfg, endpoints, extraParams);
      }
    } catch (cause) {
      // `concurrent-session` detection is deferred (spec Q6); all
      // `token_login` failures map to `token-invalid` for now, with a TODO
      // pointing at the sibling concurrent-login-guard spec.
      // TODO(FR-2616 Q6): classify `concurrent-session` once the backend
      // signal from `.specs/draft-concurrent-login-guard/` lands.
      logger.error('[STokenLoginBoundary] token_login failed', cause);
      surfaceError({ kind: 'token-invalid', cause });
      return;
    }

    if (!eventDispatchedRef.current) {
      eventDispatchedRef.current = true;
      document.dispatchEvent(
        new CustomEvent('backend-ai-connected', { detail: client }),
      );
    }

    setPhase({ name: 'success' });
    onSuccess?.(client);
  });

  useEffect(() => {
    if (startedForKeyRef.current === retryKey) {
      return;
    }
    startedForKeyRef.current = retryKey;
    runLoginSequence();
  }, [retryKey]);

  const retry = useCallback(() => {
    setPhase({ name: 'pending' });
    setRetryKey((k) => k + 1);
  }, []);

  if (phase.name === 'error') {
    if (errorFallback) {
      return <>{errorFallback(phase.error, retry)}</>;
    }
    return <DefaultErrorCard error={phase.error} onRetry={retry} />;
  }

  if (phase.name === 'success') {
    return <>{children}</>;
  }

  // pending — show fallback while the sequence runs.
  return <>{fallback ?? <DefaultFallback />}</>;
};

/**
 * Map an error kind to its PascalCase i18n key suffix. The i18n schema
 * restricts message keys to a flat two-level shape (`module.Key`) where
 * `Key` must begin with an uppercase letter, so kinds like
 * `missing-token` cannot appear verbatim in the key.
 */
const kindToI18nKey = (kind: STokenLoginError['kind']): string =>
  kind
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

/**
 * Connecting card shown while the authentication sequence is in flight.
 * The card is visually subdued so reviewers can tell the app is still
 * working but hasn't failed.
 */
const DefaultFallback: React.FC = () => {
  const { t } = useTranslation();
  return (
    <BAIFlex
      direction="column"
      align="center"
      justify="center"
      style={{ minHeight: '60vh', padding: 24 }}
    >
      <BAICard style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
        <BAIFlex direction="column" align="center" gap="md">
          <Spin size="large" />
          <Typography.Title level={5} style={{ margin: 0 }}>
            {t('sTokenLoginBoundary.AuthenticatingTitle')}
          </Typography.Title>
          <Typography.Text type="secondary">
            {t('sTokenLoginBoundary.AuthenticatingDescription')}
          </Typography.Text>
        </BAIFlex>
      </BAICard>
    </BAIFlex>
  );
};

/**
 * Built-in error card rendered when `errorFallback` is not provided.
 * Offers two actions: Retry (runs the sequence again via BAIButton's
 * async `action` prop so the loading state appears automatically) and
 * Copy details (serializes the `{ kind, cause }` payload to JSON and
 * writes it to the clipboard for support follow-up).
 */
const DefaultErrorCard: React.FC<{
  error: STokenLoginError;
  onRetry: () => void;
}> = ({ error, onRetry }) => {
  const { t } = useTranslation();
  const { message } = App.useApp();

  const kindKey = kindToI18nKey(error.kind);
  const title = t(`sTokenLoginBoundary.Error${kindKey}Title`);
  const description = t(`sTokenLoginBoundary.Error${kindKey}Description`);
  const causeDetail =
    'cause' in error && error.cause
      ? String((error.cause as Error)?.message ?? error.cause)
      : null;

  const handleRetry = useCallback(async () => {
    // Wrap in a Promise so BAIButton.action triggers its async loading
    // state; the synchronous state reset completes before the next
    // render, which is visually indistinguishable from the live
    // sequence restart.
    await Promise.resolve();
    onRetry();
  }, [onRetry]);

  const handleCopy = useCallback(async () => {
    const payload = {
      kind: error.kind,
      cause: causeDetail,
    };
    await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    message.success(t('sTokenLoginBoundary.ErrorDetailsCopied'));
  }, [error, causeDetail, message, t]);

  return (
    <BAIFlex
      direction="column"
      align="center"
      justify="center"
      style={{ minHeight: '60vh', padding: 24 }}
    >
      <BAICard
        status="error"
        title={title}
        style={{ maxWidth: 520, width: '100%' }}
      >
        <BAIFlex direction="column" gap="md" align="stretch">
          <Typography.Paragraph style={{ margin: 0 }}>
            {description}
          </Typography.Paragraph>
          {causeDetail && (
            <Typography.Paragraph
              type="secondary"
              style={{ margin: 0, fontSize: 12, whiteSpace: 'pre-wrap' }}
            >
              {causeDetail}
            </Typography.Paragraph>
          )}
          <BAIFlex direction="row" gap="sm" justify="end">
            <BAIButton onClick={handleCopy}>
              {t('sTokenLoginBoundary.CopyErrorDetails')}
            </BAIButton>
            <BAIButton type="primary" action={handleRetry}>
              {t('sTokenLoginBoundary.Retry')}
            </BAIButton>
          </BAIFlex>
        </BAIFlex>
      </BAICard>
    </BAIFlex>
  );
};

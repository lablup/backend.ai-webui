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
import { getDefaultLoginConfig } from '../helper/loginConfig';
import {
  connectViaGQL,
  createBackendAIClient,
  tokenLogin,
} from '../helper/loginSessionAuth';
import { useResolvedApiEndpoint } from '../hooks/useResolvedApiEndpoint';
import { loginConfigState } from '../hooks/useWebUIConfig';
import { jotaiStore } from './DefaultProviders';
import { App, Form, Input, Spin, Typography } from 'antd';
import { BAIButton, BAICard, BAIFlex, useBAILogger } from 'backend.ai-ui';
import { useAtomValue } from 'jotai';
import {
  Suspense,
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
  /**
   * Webserver responded `require-totp-authentication` (or the equivalent
   * legacy detail string). The default error card swaps its action area
   * for an inline OTP input; submitting retries `token_login` with
   * `{ otp }` folded into `extraParams`. `invalidOtp` is set true when the
   * retry itself returned a TOTP rejection, so the card can show an
   * invalid-code hint above the input without re-classifying the error.
   */
  | { kind: 'totp-required'; cause: unknown; invalidOtp?: boolean }
  /**
   * Webserver reported an existing active session for this user
   * (`active-login-session-exists`). The default error card swaps its
   * action area for a "terminate previous session?" confirm pair;
   * confirming retries `token_login` with `force: true` folded into
   * `extraParams` (sticky for subsequent retries within the same mount,
   * mirroring LoginView's `forceLoginApprovedRef`).
   */
  | { kind: 'concurrent-session'; cause: unknown }
  | { kind: 'unknown'; cause: unknown };

/**
 * Extract the trailing segment of a Backend.AI problem type URL.
 * e.g. "https://api.backend.ai/probs/active-login-session-exists"
 *      → "active-login-session-exists"
 *
 * Mirrors `LoginView.extractErrorType` so both entry points normalize the
 * authenticated-probe type the same way before switching on it.
 */
const extractErrorType = (typeUrl: string | null | undefined): string => {
  if (!typeUrl) return '';
  const parts = typeUrl.split('/');
  return parts[parts.length - 1] || '';
};

/**
 * Classify a `tokenLogin` failure into the appropriate `STokenLoginError`
 * kind.
 *
 * Uses duck-typed field extraction (not `instanceof TokenLoginFailedError`)
 * so error objects crossing module boundaries — Jest mocked imports, HMR
 * reloads where two copies of the helper module coexist — classify the
 * same as direct throws.
 *
 * Primary signal: the authenticated-probe `type` surfaced by
 * `client.token_login` and propagated through `TokenLoginFailedError.failType`.
 * Strings are a safety net only, for older webservers that omit the
 * `type` field on the failure envelope.
 */
const classifyTokenLoginFailure = (
  err: unknown,
  submittedOtp: string | null,
): STokenLoginError => {
  const bag =
    typeof err === 'object' && err !== null
      ? (err as Record<string, unknown>)
      : {};
  const failReason =
    typeof bag.failReason === 'string'
      ? bag.failReason
      : typeof (err as Error | undefined)?.message === 'string'
        ? (err as Error).message
        : '';
  const failType =
    typeof bag.failType === 'string' ? extractErrorType(bag.failType) : '';

  // Primary: switch on the structured authenticated-probe type.
  switch (failType) {
    case 'require-totp-authentication':
    case 'require-totp-registration':
      return {
        kind: 'totp-required',
        cause: err,
        invalidOtp: !!submittedOtp,
      };
    case 'active-login-session-exists':
      return { kind: 'concurrent-session', cause: err };
    case 'rejected-by-hook':
      // The hook rejection envelope piggybacks on `details` for the real
      // classification. Currently only TOTP-code validation errors need
      // special handling — see LoginView.
      if (
        failReason.includes('Invalid TOTP code provided') ||
        failReason.includes('Failed to validate OTP')
      ) {
        return { kind: 'totp-required', cause: err, invalidOtp: true };
      }
      break;
  }

  // Fallback: older backends that omit `type`. Substring set matches
  // LoginView's legacy fallback so both code paths classify identically.
  const needle = failReason;
  if (
    needle.includes('You must authenticate using Two-Factor Authentication') ||
    needle.includes('OTP not provided')
  ) {
    return {
      kind: 'totp-required',
      cause: err,
      invalidOtp: !!submittedOtp,
    };
  }
  if (
    needle.includes('Invalid TOTP code provided') ||
    needle.includes('Failed to validate OTP')
  ) {
    return { kind: 'totp-required', cause: err, invalidOtp: true };
  }
  if (needle.includes('existing active login session')) {
    return { kind: 'concurrent-session', cause: err };
  }

  return { kind: 'token-invalid', cause: err };
};

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
 * Sub-phase tracked while `phase === 'pending'`. Drives the description
 * on the default loading card so the user sees progress instead of a
 * single static "signing you in" line during the (potentially
 * multi-second) token exchange.
 *
 *   - `connecting`:     endpoint resolve, manager ping, existing-session check
 *   - `authenticating`: `token_login` + profile/GQL bootstrap
 */
type PendingStep = 'connecting' | 'authenticating';

/**
 * sToken-based login boundary. Authenticates via `client.token_login` using
 * the caller-supplied `sToken`, dispatches `backend-ai-connected` exactly
 * once on success, and only then renders `children`. See spec section
 * "컴포넌트 설계" and "내부 동작 시퀀스" for the full contract.
 */
export const STokenLoginBoundary: React.FC<STokenLoginBoundaryProps> = (
  props,
) => {
  'use memo';
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
  const [pendingStep, setPendingStep] = useState<PendingStep>('connecting');
  const [retryKey, setRetryKey] = useState(0);
  // Drives the inline confirm/submit button loading state. Flipped on by
  // `retryInline` and cleared deterministically at every terminal point of
  // `runLoginSequence` (success + every `surfaceError` path) so the button
  // never outlives the retry it initiated.
  const [isInlineRetrying, setIsInlineRetrying] = useState(false);

  // Guard against React StrictMode's dev double-invoke of effects. Once the
  // sequence has started for a given retryKey, a second fire is ignored.
  const startedForKeyRef = useRef<number | null>(null);
  // Guard against duplicate `backend-ai-connected` dispatch across the
  // component lifetime, including after retries. The event is broadcast at
  // most once per successful login; downstream subscribers (Relay, plugin
  // endpoint wiring) assume idempotency does not hold for them.
  const eventDispatchedRef = useRef(false);
  // Sticky OTP across retries within this mount. Mirrors LoginView, which
  // keeps the value in its Form field until the user explicitly changes it
  // — the same OTP must be replayed if a later retry kind (e.g. force-
  // login confirmation) happens between the original TOTP submit and the
  // eventual success. The ref is overwritten on each `retryWithOtp(otp)`
  // (so the TOTP input always wins over the previous value) and stale
  // codes self-correct via the server's invalid-OTP response → the card
  // surfaces the invalid hint and the user types a fresh one.
  const submittedOtpRef = useRef<string | null>(null);
  // Sticky force-login approval: once the user confirms "terminate previous
  // session", every subsequent retry in this mount includes `force: true`
  // (mirrors LoginView's `forceLoginApprovedRef` so a TOTP challenge that
  // follows a force approval does not silently drop the force flag).
  const forceApprovedRef = useRef(false);
  const surfaceError = useEffectEvent((error: STokenLoginError) => {
    setPhase({ name: 'error', error });
    setIsInlineRetrying(false);
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

    // Prefer the live atom state; fall back to the documented defaults so
    // `applyConfigToClient(cfg)` downstream of `connectViaGQL` does not write
    // `undefined` into `backendaiclient._config`. `loadConfigFromWebServer`
    // is intentionally NOT invoked here — see spec Q2.
    const cfg =
      loginConfig ??
      jotaiStore.get(loginConfigState) ??
      getDefaultLoginConfig();
    const endpoints =
      ((
        globalThis as { backendaioptions?: { get: (k: string) => unknown } }
      ).backendaioptions?.get('endpoints') as string[] | undefined) ?? [];

    // Both `submittedOtpRef` and `forceApprovedRef` are sticky for the
    // lifetime of this mount so that an interactive sequence (e.g. TOTP
    // submit followed by a concurrent-session force confirmation) carries
    // every accumulated factor into the single `token_login` call the
    // server validates. Clearing is left to component unmount.
    const submittedOtp = submittedOtpRef.current;
    const effectiveParams: Record<string, string | boolean> = {
      ...extraParams,
      ...(submittedOtp ? { otp: submittedOtp } : {}),
      ...(forceApprovedRef.current ? { force: true } : {}),
    };

    // Connectivity/session probe above is done; we're now committing to
    // either the token exchange path or the pre-authenticated GQL
    // bootstrap. Either way the card description shifts from
    // "connecting" to "authenticating".
    setPendingStep('authenticating');

    try {
      if (alreadyLoggedIn) {
        // Session already exists — wire up the GraphQL client / groups /
        // endpoint history the same way `tokenLogin` would, without
        // re-authenticating. `backend-ai-connected` is still dispatched
        // below so Relay and plugin subscribers unblock even on this
        // fast-path.
        await connectViaGQL(client, cfg, endpoints);
      } else {
        await tokenLogin(client, sToken!, cfg, endpoints, effectiveParams);
      }
    } catch (cause) {
      logger.error('[STokenLoginBoundary] token_login failed', cause);
      surfaceError(classifyTokenLoginFailure(cause, submittedOtp));
      return;
    }

    if (!eventDispatchedRef.current) {
      eventDispatchedRef.current = true;
      document.dispatchEvent(
        new CustomEvent('backend-ai-connected', { detail: client }),
      );
    }

    setPhase({ name: 'success' });
    setIsInlineRetrying(false);
    onSuccess?.(client);
  });

  useEffect(() => {
    if (startedForKeyRef.current === retryKey) {
      return;
    }
    startedForKeyRef.current = retryKey;
    runLoginSequence();
  }, [retryKey]);

  const retry = () => {
    setPhase({ name: 'pending' });
    // Any retry restarts the sequence from scratch, so the sub-phase
    // also resets to the initial "connecting" label.
    setPendingStep('connecting');
    setIsInlineRetrying(false);
    setRetryKey((k) => k + 1);
  };

  // Inline retry used by the TOTP submit and force-login confirm paths.
  // Unlike `retry`, this leaves `phase === 'error'` untouched so the
  // current error card stays on screen; `isInlineRetrying` drives the
  // confirm button's loading state and is cleared at every
  // `runLoginSequence` terminal (success + every `surfaceError` path).
  const retryInline = () => {
    setIsInlineRetrying(true);
    setRetryKey((k) => k + 1);
  };

  // Fold a user-supplied OTP into the next retry. Overwrites the sticky
  // value so the TOTP form's latest submission wins. Called from the
  // inline TOTP form inside `DefaultErrorCard`.
  const retryWithOtp = (otp: string) => {
    submittedOtpRef.current = otp;
    retryInline();
  };

  // Approve force-login for all subsequent retries in this mount and
  // immediately retry. Called from the inline concurrent-session confirm.
  const retryWithForce = () => {
    forceApprovedRef.current = true;
    retryInline();
  };

  if (phase.name === 'error') {
    if (errorFallback) {
      return <>{errorFallback(phase.error, retry)}</>;
    }
    return (
      <DefaultErrorCard
        error={phase.error}
        isInlineRetrying={isInlineRetrying}
        onRetry={retry}
        onSubmitOtp={retryWithOtp}
        onConfirmForce={retryWithForce}
      />
    );
  }

  if (phase.name === 'success') {
    return <>{children}</>;
  }

  // pending — show fallback while the sequence runs. Caller-supplied
  // `fallback` is rendered as-is; the built-in `DefaultFallback` gets the
  // current sub-phase so its description line reflects progress.
  return <>{fallback ?? <DefaultFallback step={pendingStep} />}</>;
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
 *
 * `step` drives the description line so the user can see which phase is
 * currently running — mostly relevant on slower networks where
 * `get_manager_version` and `token_login` together take a few seconds.
 * The outer Suspense boundary (during endpoint resolution) renders this
 * without a `step` prop, which defaults to `connecting` — the same label
 * the inner component starts with on mount.
 */
const DefaultFallback: React.FC<{ step?: PendingStep }> = ({
  step = 'connecting',
}) => {
  'use memo';
  const { t } = useTranslation();
  const descriptionKey =
    step === 'authenticating'
      ? 'sTokenLoginBoundary.AuthenticatingDescription'
      : 'sTokenLoginBoundary.ConnectingDescription';
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
            {t(descriptionKey)}
          </Typography.Text>
        </BAIFlex>
      </BAICard>
    </BAIFlex>
  );
};

/**
 * Built-in error card rendered when `errorFallback` is not provided.
 *
 * For most error kinds the card shows a description + {Copy details,
 * Retry} action pair. Two kinds swap the action area inline (per design:
 * no separate modal — the user stays on the same card layout and only
 * the lower half changes):
 *
 *   - `totp-required`       → OTP input + Submit button; on submit the
 *                             parent retries `token_login` with the `otp`
 *                             folded into `extraParams`.
 *   - `concurrent-session`  → "terminate previous session?" confirm pair;
 *                             Login button retries with `force: true`.
 *
 * Both kinds keep the card mounted through the retry; `isInlineRetrying`
 * drives the confirm button's loading state deterministically (cleared
 * at every `runLoginSequence` terminal). No status badge for these kinds
 * — only genuine terminal failures get the `error` tint.
 */
const DefaultErrorCard: React.FC<{
  error: STokenLoginError;
  isInlineRetrying: boolean;
  onRetry: () => void;
  onSubmitOtp: (otp: string) => void;
  onConfirmForce: () => void;
}> = ({ error, isInlineRetrying, onRetry, onSubmitOtp, onConfirmForce }) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const { logger } = useBAILogger();

  const kindKey = kindToI18nKey(error.kind);
  const title = t(`sTokenLoginBoundary.Error${kindKey}Title`);
  const description = t(`sTokenLoginBoundary.Error${kindKey}Description`);
  const causeDetail =
    'cause' in error && error.cause
      ? String((error.cause as Error)?.message ?? error.cause)
      : null;

  const isInteractiveKind =
    error.kind === 'totp-required' || error.kind === 'concurrent-session';

  // Wrap in a Promise so BAIButton.action triggers its async loading
  // state; the synchronous state reset completes before the next render,
  // which is visually indistinguishable from the live sequence restart.
  const handleRetry = async () => {
    await Promise.resolve();
    onRetry();
  };

  const handleCopy = async () => {
    const payload = {
      kind: error.kind,
      cause: causeDetail,
    };
    try {
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
      message.success(t('sTokenLoginBoundary.ErrorDetailsCopied'));
    } catch (copyError) {
      logger.warn('[STokenLoginBoundary] clipboard write failed', copyError);
      message.error(t('sTokenLoginBoundary.ErrorDetailsCopyFailed'));
    }
  };

  return (
    <BAIFlex
      direction="column"
      align="center"
      justify="center"
      style={{ minHeight: '60vh', padding: 24 }}
    >
      <BAICard
        status={isInteractiveKind ? 'default' : 'error'}
        title={title}
        style={{ maxWidth: 520, width: '100%' }}
      >
        <BAIFlex direction="column" gap="md" align="stretch">
          <Typography.Paragraph style={{ margin: 0 }}>
            {description}
          </Typography.Paragraph>
          {causeDetail && error.kind !== 'totp-required' && (
            <Typography.Paragraph
              type="secondary"
              style={{ margin: 0, fontSize: 12, whiteSpace: 'pre-wrap' }}
            >
              {causeDetail}
            </Typography.Paragraph>
          )}
          {error.kind === 'totp-required' ? (
            <TotpInlineForm
              invalidOtp={!!error.invalidOtp}
              isSubmitting={isInlineRetrying}
              onSubmit={onSubmitOtp}
            />
          ) : error.kind === 'concurrent-session' ? (
            <BAIFlex direction="row" gap="sm" justify="end">
              <BAIButton action={handleCopy} disabled={isInlineRetrying}>
                {t('sTokenLoginBoundary.CopyErrorDetails')}
              </BAIButton>
              <BAIButton
                type="primary"
                loading={isInlineRetrying}
                disabled={isInlineRetrying}
                onClick={onConfirmForce}
              >
                {t('login.Login')}
              </BAIButton>
            </BAIFlex>
          ) : (
            <BAIFlex direction="row" gap="sm" justify="end">
              <BAIButton action={handleCopy}>
                {t('sTokenLoginBoundary.CopyErrorDetails')}
              </BAIButton>
              <BAIButton type="primary" action={handleRetry}>
                {t('sTokenLoginBoundary.Retry')}
              </BAIButton>
            </BAIFlex>
          )}
        </BAIFlex>
      </BAICard>
    </BAIFlex>
  );
};

/**
 * Inline OTP input + Submit button rendered inside `DefaultErrorCard`
 * when the boundary classifies the failure as `totp-required`. Trimmed
 * locally — the webserver ignores whitespace but users routinely paste a
 * code with trailing spaces from authenticator apps.
 *
 * `isSubmitting` is owned by the parent (`isInlineRetrying`) so the
 * loading state tracks the real lifecycle of `runLoginSequence`, not a
 * local boolean that could desync if the form unmounts mid-retry.
 */
const TotpInlineForm: React.FC<{
  invalidOtp: boolean;
  isSubmitting: boolean;
  onSubmit: (otp: string) => void;
}> = ({ invalidOtp, isSubmitting, onSubmit }) => {
  'use memo';
  const { t } = useTranslation();
  const [form] = Form.useForm<{ otp: string }>();
  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={(values) => {
        const trimmed = (values.otp ?? '').trim();
        if (!trimmed) return;
        onSubmit(trimmed);
      }}
    >
      <Form.Item
        name="otp"
        label={t('sTokenLoginBoundary.TotpPlaceholder')}
        rules={[
          {
            required: true,
            message: t('sTokenLoginBoundary.ErrorTotpRequiredMessage'),
          },
          {
            pattern: /^\d{6}$/,
            message: t('sTokenLoginBoundary.ErrorTotpInvalidHint'),
          },
        ]}
        validateStatus={invalidOtp ? 'error' : undefined}
        help={invalidOtp ? t('sTokenLoginBoundary.ErrorTotpInvalidHint') : null}
        style={{ marginBottom: 12 }}
      >
        <Input.OTP
          length={6}
          size="large"
          disabled={isSubmitting}
          aria-label={t('sTokenLoginBoundary.TotpPlaceholder')}
        />
      </Form.Item>
      <BAIFlex direction="row" gap="sm" justify="end">
        <BAIButton
          type="primary"
          htmlType="submit"
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          {t('sTokenLoginBoundary.SubmitOtp')}
        </BAIButton>
      </BAIFlex>
    </Form>
  );
};

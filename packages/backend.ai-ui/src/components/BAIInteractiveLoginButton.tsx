/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
*/
import useBAIInteractiveLogin, {
  type BAIInteractiveLoginFailure,
  type BAIInteractiveLoginFailureReason,
} from '../hooks/useBAIInteractiveLogin';
import { useBAIi18n } from '../hooks/useBAIi18n';
import { useEventNotStable } from '../hooks/useEventNotStable';
import BAIAlert from './BAIAlert';
import BAIFlex from './BAIFlex';
import BAIText from './BAIText';
import { Button, type ButtonProps } from '@astryxdesign/core/Button';
import { LogIn } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export interface BAIInteractiveLoginButtonProps extends Omit<
  ButtonProps,
  'label' | 'onClick' | 'clickAction' | 'isLoading'
> {
  /** Absolute URL of the Backend.AI webserver, e.g. `https://webserver.example.com`. */
  webserverUrl: string;
  /** Name of the consuming application, shown on the provider page and in the failure copy. */
  appName: string;
  /** Absolute or relative http(s) URL the provider page returns to. Defaults to the current document URL. */
  callbackUrl?: string;
  timeoutMs?: number;
  /** Receives the webserver session id so the host can exchange it for its own credentials. */
  onSessionVerified: (sessionId: string) => void | Promise<void>;
  onFailure?: (reason: BAIInteractiveLoginFailureReason) => void;
  /**
   * Render the failure inline: an error alert for a real failure, a neutral
   * hint under the button for the ordinary `no_session` outcome.
   * @default true
   */
  showFailureAlert?: boolean;
  label?: string;
}

const BAIInteractiveLoginButton = ({
  webserverUrl,
  appName,
  callbackUrl,
  timeoutMs,
  onSessionVerified,
  onFailure,
  showFailureAlert = true,
  label,
  variant = 'primary',
  icon = <LogIn size="1em" />,
  ...buttonProps
}: BAIInteractiveLoginButtonProps) => {
  'use memo';
  const { t } = useBAIi18n();
  const {
    probe,
    redirectToInteractiveLogin,
    reportFailure,
    isProbing,
    failure,
  } = useBAIInteractiveLogin({
    webserverUrl,
    appName,
    callbackUrl,
    timeoutMs,
  });
  // The probe inputs; a verification belongs to the key it was made under.
  const probeKey = `${timeoutMs ?? ''}\u0000${webserverUrl}`;
  const [verifiedProbeKey, setVerifiedProbeKey] = useState<string | null>(null);
  const [relaysInFlight, setRelaysInFlight] = useState(0);
  const isVerified = verifiedProbeKey === probeKey;
  const isRelaying = relaysInFlight > 0;
  // Bumped on unmount or re-probe so a probe or relay that settles late is
  // dropped.
  const probeGenerationRef = useRef(0);

  const handleSessionVerified = useEventNotStable(onSessionVerified);
  const handleFailure = useEventNotStable(
    (reason: BAIInteractiveLoginFailureReason) => onFailure?.(reason),
  );
  const runProbe = useEventNotStable(
    async (generation: number, key: string) => {
      const isCurrent = () => probeGenerationRef.current === generation;
      const result = await probe();
      if (!isCurrent()) return;
      if (!result.ok) {
        handleFailure(result.reason);
        return;
      }
      // The host's token exchange is a network round-trip of its own; keep the
      // button busy so it cannot navigate away mid-exchange.
      setRelaysInFlight((count) => count + 1);
      try {
        await handleSessionVerified(result.sessionId);
        if (isCurrent()) setVerifiedProbeKey(key);
      } catch {
        if (!isCurrent()) return;
        reportFailure('relay_failed');
        handleFailure('relay_failed');
      } finally {
        setRelaysInFlight((count) => count - 1);
      }
    },
  );

  // A host that fills `webserverUrl` in after mount gets a fresh probe.
  useEffect(() => {
    const generation = probeGenerationRef.current + 1;
    probeGenerationRef.current = generation;
    void runProbe(generation, probeKey);
    return () => {
      probeGenerationRef.current += 1;
    };
  }, [probeKey, runProbe]);

  const handleClick = () => {
    const reason = redirectToInteractiveLogin();
    if (reason) handleFailure(reason);
  };

  return (
    <BAIFlex direction="column" gap="sm" align="stretch">
      {showFailureAlert && failure && failure.reason !== 'no_session' ? (
        <BAIAlert
          type="error"
          title={t('comp:BAIInteractiveLoginButton.failure.Title')}
          description={describeFailure(
            t,
            failure.reason,
            failure.status,
            appName,
          )}
        />
      ) : null}
      {isVerified ? null : (
        <Button
          {...buttonProps}
          variant={variant}
          icon={icon}
          isLoading={isProbing || isRelaying}
          label={
            isProbing
              ? t('comp:BAIInteractiveLoginButton.CheckingSession')
              : (label ??
                t('comp:BAIInteractiveLoginButton.SignInWithBackendAI'))
          }
          clickAction={handleClick}
        />
      )}
      {showFailureAlert && failure?.reason === 'no_session' ? (
        <BAIText type="secondary" size="sm">
          {describeNoSession(t, appName)}
        </BAIText>
      ) : null}
    </BAIFlex>
  );
};

type TranslateFn = (key: string, options?: Record<string, unknown>) => string;

/**
 * `no_session` is the ordinary "not signed in yet" outcome, not a failure — it
 * is a neutral hint under the button, never the error alert.
 */
const describeNoSession = (t: TranslateFn, appName: string): string => {
  const prefix = 'comp:BAIInteractiveLoginButton.failure';
  // The webserver's session cookie carries no SameSite attribute, so a browser
  // treats it as Lax and withholds it from a cross-site probe.
  return globalThis.location?.protocol === 'https:'
    ? t(`${prefix}.NoSessionOverHttps`, { appName })
    : t(`${prefix}.NoSessionOverHttp`, { appName });
};

const describeFailure = (
  t: TranslateFn,
  reason: Exclude<BAIInteractiveLoginFailureReason, 'no_session'>,
  status: BAIInteractiveLoginFailure['status'],
  appName: string,
): string => {
  const prefix = 'comp:BAIInteractiveLoginButton.failure';
  switch (reason) {
    case 'no_endpoint':
      return t(`${prefix}.NoEndpoint`, { appName });
    case 'invalid_callback':
      return t(`${prefix}.InvalidCallback`, { appName });
    case 'cors_or_mixed':
      return t(`${prefix}.CorsOrMixed`);
    case 'timeout':
      return t(`${prefix}.Timeout`);
    case 'http_error':
      return t(`${prefix}.HttpError`, { status });
    case 'invalid_response':
      return t(`${prefix}.InvalidResponse`);
    case 'no_session_id':
      return t(`${prefix}.NoSessionId`);
    case 'relay_failed':
      return t(`${prefix}.RelayFailed`, { appName });
  }
};

export default BAIInteractiveLoginButton;

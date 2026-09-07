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
  /** Absolute or relative URL the provider page returns to. Defaults to the current document URL. */
  callbackUrl?: string;
  timeoutMs?: number;
  /** Receives the webserver session id so the host can exchange it for its own credentials. */
  onSessionVerified: (sessionId: string) => void | Promise<void>;
  onFailure?: (reason: BAIInteractiveLoginFailureReason) => void;
  /** Render the failure reason in an inline alert. @default true */
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
  const [isVerified, setIsVerified] = useState(false);
  const hasProbedRef = useRef(false);

  const handleSessionVerified = useEventNotStable(onSessionVerified);
  const handleFailure = useEventNotStable(
    (reason: BAIInteractiveLoginFailureReason) => onFailure?.(reason),
  );
  const runProbe = useEventNotStable(async () => {
    const result = await probe();
    if (!result.ok) {
      handleFailure(result.reason);
      return;
    }
    try {
      await handleSessionVerified(result.sessionId);
      setIsVerified(true);
    } catch {
      reportFailure('relay_failed');
      handleFailure('relay_failed');
    }
  });

  useEffect(() => {
    if (hasProbedRef.current) return;
    hasProbedRef.current = true;
    void runProbe();
  }, [runProbe]);

  return (
    <BAIFlex direction="column" gap="sm" align="stretch">
      {showFailureAlert && failure ? (
        <BAIAlert
          type="error"
          title={t('comp:BAIInteractiveLoginButton.failure.Title')}
          description={describeFailure(t, failure, appName)}
        />
      ) : null}
      {isVerified ? null : (
        <Button
          {...buttonProps}
          variant={variant}
          icon={<LogIn size="1em" />}
          isLoading={isProbing}
          label={
            isProbing
              ? t('comp:BAIInteractiveLoginButton.CheckingSession')
              : (label ??
                t('comp:BAIInteractiveLoginButton.SignInWithBackendAI'))
          }
          clickAction={redirectToInteractiveLogin}
        />
      )}
    </BAIFlex>
  );
};

const describeFailure = (
  t: (key: string, options?: Record<string, unknown>) => string,
  { reason, status }: BAIInteractiveLoginFailure,
  appName: string,
): string => {
  const prefix = 'comp:BAIInteractiveLoginButton.failure';
  switch (reason) {
    case 'no_endpoint':
      return t(`${prefix}.NoEndpoint`, { appName });
    case 'cors_or_mixed':
      return t(`${prefix}.CorsOrMixed`);
    case 'timeout':
      return t(`${prefix}.Timeout`);
    case 'http_error':
      return t(`${prefix}.HttpError`, { status });
    case 'invalid_response':
      return t(`${prefix}.InvalidResponse`);
    case 'no_session':
      // The webserver's session cookie carries no SameSite attribute, so a
      // browser treats it as Lax and withholds it from a cross-site probe.
      return globalThis.location?.protocol === 'https:'
        ? t(`${prefix}.NoSessionOverHttps`, { appName })
        : t(`${prefix}.NoSessionOverHttp`, { appName });
    case 'no_session_id':
      return t(`${prefix}.NoSessionId`);
    case 'relay_failed':
      return t(`${prefix}.RelayFailed`, { appName });
  }
};

export default BAIInteractiveLoginButton;

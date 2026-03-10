/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
/**
 * AppLauncherFlow - Step-based app launcher flow component.
 *
 * Orchestrates token-based authentication, session resolution, and app
 * launching with a visible progress UI. Replaces the legacy EduAppLauncher
 * which rendered an empty fragment with no user feedback.
 */
import { useApiEndpoint } from '../hooks/useApiEndpoint';
import type { AppLauncherParams } from '../hooks/useAppLauncherParams';
import useSessionResolver from '../hooks/useSessionResolver';
import { useTokenAuth } from '../hooks/useTokenAuth';
import { Alert, Button, Card, Spin, Steps } from 'antd';
import React, { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface AppLauncherFlowProps {
  params: AppLauncherParams;
}

const AppLauncherFlow: React.FC<AppLauncherFlowProps> = ({ params }) => {
  'use memo';

  const { t } = useTranslation();
  const apiEndpoint = useApiEndpoint();
  const hasLaunchedRef = useRef(false);

  const endpoint = params.endpoint || apiEndpoint;

  const {
    authenticate,
    status: authStatus,
    error: authError,
  } = useTokenAuth(params.sToken, endpoint);

  const {
    resolveSession,
    status: sessionStatus,
    error: sessionError,
  } = useSessionResolver({
    app: params.app,
    session_id: params.session_id,
    session_template: params.session_template,
    resources: params.resources,
    sToken: params.sToken,
  });

  // Chain: when auth succeeds, start session resolution
  useEffect(() => {
    if (authStatus === 'authenticated') {
      resolveSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authStatus]);

  // Auto-start on mount
  useEffect(() => {
    if (hasLaunchedRef.current) return;
    hasLaunchedRef.current = true;

    if (!params.isValid) return;
    authenticate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRetry = useCallback(() => {
    hasLaunchedRef.current = false;
    authenticate();
  }, [authenticate]);

  // Determine current step and status
  const currentStep =
    authStatus === 'idle' || authStatus === 'authenticating'
      ? 0
      : authStatus === 'error'
        ? 0
        : sessionStatus === 'idle' ||
            sessionStatus === 'finding' ||
            sessionStatus === 'creating'
          ? 1
          : sessionStatus === 'error'
            ? 1
            : 2;

  const hasError =
    !params.isValid || authStatus === 'error' || sessionStatus === 'error';
  const errorMessage = !params.isValid
    ? t('eduapi.MissingSToken')
    : authError || sessionError;

  const stepStatus = hasError ? ('error' as const) : undefined;

  const getSessionStepDescription = () => {
    if (sessionStatus === 'finding') return t('eduapi.StepFindingSession');
    if (sessionStatus === 'creating') return t('eduapi.StepCreatingSession');
    if (sessionStatus === 'error') return sessionError;
    if (sessionStatus === 'launching' || sessionStatus === 'done')
      return t('eduapi.StepLaunchingApp', { app: params.app });
    return '';
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        padding: 24,
      }}
    >
      <Card style={{ width: 520, maxWidth: '100%' }}>
        <Steps
          current={currentStep}
          status={stepStatus}
          items={[
            {
              title: t('eduapi.StepAuthentication'),
              description:
                authStatus === 'authenticating'
                  ? t('eduapi.StepAuthenticating')
                  : authStatus === 'error'
                    ? authError
                    : authStatus === 'authenticated'
                      ? ''
                      : '',
            },
            {
              title: t('eduapi.StepSession'),
              description: getSessionStepDescription(),
            },
            {
              title: t('eduapi.StepLaunch'),
              description:
                sessionStatus === 'launching'
                  ? t('eduapi.StepLaunchingApp', { app: params.app })
                  : sessionStatus === 'done'
                    ? t('eduapi.StepLaunchingApp', { app: params.app })
                    : '',
            },
          ]}
        />

        {(authStatus === 'authenticating' ||
          sessionStatus === 'finding' ||
          sessionStatus === 'creating' ||
          sessionStatus === 'launching') && (
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <Spin size="large" />
          </div>
        )}

        {hasError && (
          <div style={{ marginTop: 24 }}>
            <Alert
              type="error"
              message={t('eduapi.LaunchFailed')}
              description={errorMessage}
              showIcon
            />
            {params.isValid && (
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <Button type="primary" onClick={handleRetry}>
                  {t('eduapi.Retry')}
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default AppLauncherFlow;

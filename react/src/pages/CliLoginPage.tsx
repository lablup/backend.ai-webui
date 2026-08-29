/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { CSSTokenVariables } from '../components/MainLayout/MainLayout';
import WebUINavigate from '../components/WebUINavigate';
import { useSuspendedBackendaiClient } from '../hooks';
import { useCurrentUserInfo } from '../hooks/backendai';
import { Button } from '@astryxdesign/core/Button';
import { CheckboxInput } from '@astryxdesign/core/CheckboxInput';
import { Code } from '@astryxdesign/core/Code';
import { CodeBlock } from '@astryxdesign/core/CodeBlock';
import { MetadataListItem } from '@astryxdesign/core/MetadataList';
import {
  BAI_Z_INDEX,
  BAIAlert,
  BAICard,
  BAIFlex,
  BAIMetadataList,
  BAIText,
} from 'backend.ai-ui';
import { Suspense, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

/** Kept in step with `deriveLoginCode` in `packages/backend.ai-agent-cli`. */
export async function deriveLoginCode(state: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(state),
  );
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 6)
    .toUpperCase();
}

export const maskSessionId = (sessionId: string): string =>
  sessionId.length > 8
    ? `${sessionId.slice(0, 4)}…${sessionId.slice(-4)}`
    : '…';

type Phase =
  | { kind: 'consent' }
  | { kind: 'done'; message?: string }
  | { kind: 'failed'; reason: string };

const CliLoginPage = () => {
  return (
    <>
      <CSSTokenVariables />
      <Suspense>
        <CliLoginGate />
      </Suspense>
    </>
  );
};

/**
 * `/cli-login` ships disabled: without `[general] enableCliLogin` the route is
 * indistinguishable from a URL that does not exist.
 */
export const CliLoginGate = () => {
  'use memo';
  const baiClient = useSuspendedBackendaiClient();
  return baiClient?._config?.enableCliLogin ? (
    <CliLoginConsent />
  ) : (
    <WebUINavigate to={'/error'} replace />
  );
};

export const CliLoginConsent = () => {
  'use memo';
  const { t } = useTranslation();
  const baiClient = useSuspendedBackendaiClient();
  const [userInfo] = useCurrentUserInfo();
  const [searchParams] = useSearchParams();
  const [agreed, setAgreed] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [code, setCode] = useState<string>();

  const port = Number(searchParams.get('port'));
  const state = searchParams.get('state') ?? '';
  const hasListener = Number.isInteger(port) && port > 0 && port < 65536;
  const callbackUrl = `http://127.0.0.1:${port}/callback`;
  const sessionId: string = baiClient._loginSessionId ?? '';
  const endpoint: string = baiClient._config.endpoint;

  const [phase, setPhase] = useState<Phase>(
    hasListener
      ? { kind: 'consent' }
      : { kind: 'failed', reason: t('cliLogin.NoListenerPort') },
  );

  // This route has no MainLayout, so the card is the page: put the boot splash
  // into login-backdrop mode the way InteractiveLoginPage does.
  useEffect(() => {
    (
      globalThis as typeof globalThis & { __enterLoginBackdrop?: () => void }
    ).__enterLoginBackdrop?.();
  }, []);

  useEffect(() => {
    if (!state) return;
    let cancelled = false;
    deriveLoginCode(state)
      .then((value) => {
        if (!cancelled) setCode(value);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [state]);

  const confirm = async () => {
    try {
      const response = await fetch(callbackUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          endpoint,
          state,
          email: userInfo.email,
        }),
      });
      const body = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        message?: string;
        error?: string;
      };
      if (!response.ok || body.ok === false) {
        setPhase({
          kind: 'failed',
          reason: t('cliLogin.HandOffRejected', {
            status: response.status,
            reason: body.error ?? body.message ?? '',
          }),
        });
        return;
      }
      setPhase({ kind: 'done', message: body.message });
    } catch {
      setPhase({ kind: 'failed', reason: t('cliLogin.HandOffUnreachable') });
    }
  };

  return (
    <BAIFlex
      direction="column"
      align="center"
      justify="center"
      style={{ position: 'fixed', inset: 0, zIndex: BAI_Z_INDEX.loginHost }}
    >
      <BAICard
        title={t('cliLogin.Title')}
        style={{ width: 560, maxWidth: '90vw' }}
      >
        <BAIFlex direction="column" gap="md" align="stretch">
          <BAIMetadataList columns="single">
            <MetadataListItem label={t('cliLogin.Account')}>
              {userInfo.email}
            </MetadataListItem>
            <MetadataListItem label={t('cliLogin.Endpoint')}>
              {endpoint}
            </MetadataListItem>
            <MetadataListItem label={t('cliLogin.VerificationCode')}>
              <Code>{code ?? '…'}</Code>
            </MetadataListItem>
          </BAIMetadataList>

          {phase.kind === 'consent' ? (
            <>
              <BAIAlert
                type="warning"
                title={t('cliLogin.ConsentTitle')}
                description={t('cliLogin.ConsentDescription')}
              />
              <BAIText type="secondary">
                {t('cliLogin.MatchCodeDescription')}
              </BAIText>
              <CheckboxInput
                label={t('cliLogin.Attestation')}
                value={agreed}
                onChange={setAgreed}
              />
              <BAIFlex direction="row" justify="end" gap="xs">
                <Button
                  size="lg"
                  label={t('button.Cancel')}
                  onClick={() =>
                    setPhase({
                      kind: 'failed',
                      reason: t('cliLogin.Cancelled'),
                    })
                  }
                />
                <Button
                  size="lg"
                  variant="primary"
                  label={t('cliLogin.Confirm')}
                  isDisabled={!agreed}
                  clickAction={confirm}
                />
              </BAIFlex>
            </>
          ) : null}

          {phase.kind === 'done' ? (
            <BAIAlert
              type="success"
              title={t('cliLogin.DoneTitle')}
              description={phase.message ?? t('cliLogin.DoneDescription')}
            />
          ) : null}

          {phase.kind === 'failed' ? (
            <>
              <BAIAlert
                type="error"
                title={t('cliLogin.FailedTitle')}
                description={phase.reason}
              />
              <BAIFlex direction="row" justify="end" gap="xs">
                {hasListener ? (
                  <Button
                    size="lg"
                    label={t('cliLogin.Retry')}
                    onClick={() => setPhase({ kind: 'consent' })}
                  />
                ) : null}
              </BAIFlex>
              <BAIAlert
                type="warning"
                title={t('cliLogin.PasteFallbackTitle')}
                description={t('cliLogin.PasteFallbackWarning')}
              />
              <BAIText type="secondary">
                {t('cliLogin.PasteFallbackDescription')}
              </BAIText>
              <CodeBlock
                code={`bai-agent login --paste --endpoint ${endpoint}`}
                width="100%"
                isWrapped
              />
              {revealed ? (
                <CodeBlock code={sessionId} width="100%" isWrapped />
              ) : (
                <BAIFlex direction="row" justify="start" gap="xs">
                  <Button
                    label={t('cliLogin.RevealSessionId')}
                    onClick={() => setRevealed(true)}
                  />
                  <BAIText type="secondary">
                    {t('cliLogin.SessionIdMasked', {
                      masked: maskSessionId(sessionId),
                    })}
                  </BAIText>
                </BAIFlex>
              )}
            </>
          ) : null}
        </BAIFlex>
      </BAICard>
    </BAIFlex>
  );
};

export default CliLoginPage;

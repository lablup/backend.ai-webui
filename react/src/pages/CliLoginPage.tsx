/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
// FR-3755 prototype: `/cli-login?port=&state=` browser-delegated CLI login.
// Throwaway — hardcoded English copy, no i18n, no tests.
import { CSSTokenVariables } from '../components/MainLayout/MainLayout';
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
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import { Suspense, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const CliLoginPage = () => {
  return (
    <>
      <CSSTokenVariables />
      <Suspense>
        <Children />
      </Suspense>
    </>
  );
};

type Phase =
  | { kind: 'consent' }
  | { kind: 'posting' }
  | { kind: 'done'; cliMessage?: string }
  | { kind: 'paste'; reason: string };

const maskId = (id: string) => `${id.slice(0, 6)}…${id.slice(-4)}`;

const Children = () => {
  'use memo';
  const client = useSuspendedBackendaiClient();
  const [userInfo] = useCurrentUserInfo();
  const { pathname, search } = useLocation();
  const [port] = useQueryState('port', parseAsInteger);
  const [state] = useQueryState('state', parseAsString);
  const [agreed, setAgreed] = useState(false);

  const sessionId: string = client._loginSessionId ?? '';
  const endpoint: string = client._config.endpoint;
  const isLocalTarget = port !== null && port > 0 && port < 65536;
  const callbackUrl = isLocalTarget ? `http://localhost:${port}/callback` : '';

  const [phase, setPhase] = useState<Phase>(() =>
    isLocalTarget
      ? { kind: 'consent' }
      : { kind: 'paste', reason: 'No local listener port was given.' },
  );

  useEffect(() => {
    (
      globalThis as typeof globalThis & { __enterLoginBackdrop?: () => void }
    ).__enterLoginBackdrop?.();
  }, []);

  const approve = async () => {
    setPhase({ kind: 'posting' });
    try {
      const res = await fetch(callbackUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint,
          sessionId,
          email: userInfo.email,
          state,
        }),
      });
      if (!res.ok) {
        setPhase({
          kind: 'paste',
          reason: `The CLI listener rejected the hand-off (HTTP ${res.status}).`,
        });
        return;
      }
      const body = await res.json().catch(() => ({}));
      setPhase({ kind: 'done', cliMessage: body?.message });
    } catch (e) {
      setPhase({
        kind: 'paste',
        reason:
          'Could not reach a CLI listener on this machine (the CLI may be running on another host, or the browser blocked the local request).',
      });
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
        title="Sign in the Backend.AI CLI with this browser"
        style={{ width: 560, maxWidth: '90vw' }}
      >
        <BAIFlex direction="column" gap="md" align="stretch">
          <BAIMetadataList columns="single">
            <MetadataListItem label="Account">
              {userInfo.email}
            </MetadataListItem>
            <MetadataListItem label="Endpoint">{endpoint}</MetadataListItem>
            <MetadataListItem label="Hand-off to">
              {isLocalTarget ? callbackUrl : 'manual paste'}
            </MetadataListItem>
          </BAIMetadataList>

          {phase.kind === 'consent' || phase.kind === 'posting' ? (
            <>
              <BAIAlert
                type="warning"
                showIcon
                title="This browser session will be shared with the CLI on your machine"
                description="The CLI will act as you (same permissions, same endpoint) until you sign out from the CLI or this session expires. Only approve if you started the CLI login yourself just now."
              />
              <CheckboxInput
                label="I started this login from the CLI on this machine and I want to share my session with it."
                value={agreed}
                onChange={setAgreed}
              />
              <BAIFlex direction="row" justify="between">
                <Button
                  size="lg"
                  label="Use another account"
                  onClick={() => {
                    document.dispatchEvent(
                      new CustomEvent('backend-ai-logout', {
                        detail: { callbackURL: `${pathname}${search}` },
                      }),
                    );
                  }}
                />
                <BAIFlex gap="xs">
                  <Button
                    size="lg"
                    label="Cancel"
                    onClick={() =>
                      setPhase({
                        kind: 'paste',
                        reason: 'You cancelled the automatic hand-off.',
                      })
                    }
                  />
                  <Button
                    size="lg"
                    variant="primary"
                    label="Approve"
                    isDisabled={!agreed}
                    isLoading={phase.kind === 'posting'}
                    onClick={approve}
                  />
                </BAIFlex>
              </BAIFlex>
            </>
          ) : null}

          {phase.kind === 'done' ? (
            <BAIAlert
              type="success"
              showIcon
              title="CLI signed in"
              description={
                phase.cliMessage ??
                'You can close this tab and return to the terminal.'
              }
            />
          ) : null}

          {phase.kind === 'paste' ? (
            <>
              <BAIAlert
                type="info"
                showIcon
                title="Paste the session id into the CLI"
                description={phase.reason}
              />
              <BAIText>
                Run <Code>backend.ai-agent login --paste</Code> in the terminal
                where the CLI lives, then paste this value. Treat it like a
                password: anyone holding it can act as {userInfo.email} on{' '}
                {endpoint}.
              </BAIText>
              <CodeBlock code={sessionId} width="100%" isWrapped />
              <BAIText type="secondary">
                Session id (masked): {maskId(sessionId)}
                {state ? ` · state: ${state}` : ''}
              </BAIText>
            </>
          ) : null}
        </BAIFlex>
      </BAICard>
    </BAIFlex>
  );
};

export default CliLoginPage;

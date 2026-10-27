/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { CSSTokenVariables } from '../components/MainLayout/MainLayout';
import { useSuspendedBackendaiClient } from '../hooks';
import { useCurrentUserInfo } from '../hooks/backendai';
import { Button } from '@lablup/ui-common/Button';
import { MetadataListItem } from '@lablup/ui-common/MetadataList';
import {
  BAI_Z_INDEX,
  BAICard,
  BAIFlex,
  BAIMetadataList,
  resolveCallbackUrl,
} from 'backend.ai-ui';
import { parseAsString, useQueryState } from 'nuqs';
import { Suspense, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

const InteractiveLoginPage = () => {
  return (
    <>
      <CSSTokenVariables />
      <Suspense>
        <Children />
      </Suspense>
    </>
  );
};

const Children = () => {
  'use memo';
  useSuspendedBackendaiClient();
  const [userInfo] = useCurrentUserInfo();
  const { pathname, search } = useLocation();
  const [callback] = useQueryState('callback', parseAsString);
  const [name] = useQueryState('name', parseAsString);
  const { t } = useTranslation();

  // The `callback` query param is attacker-craftable, so it must never be
  // assigned to `window.location.href` raw — a `javascript:` URL would execute
  // in this origin. `resolveCallbackUrl` (shared with the BUI interactive-login
  // flow) only resolves absolute http(s) URLs and drops everything else.
  // Resolved only when the param exists: without one the helper would fall
  // back to this page's own URL and show it as the callback.
  const resolvedCallback = callback ? resolveCallbackUrl(callback) : null;

  // This route has no MainLayout, so the interactive-login card is its "main
  // UI". Put the splash into login-backdrop mode (keeps the Diagonal Weave +
  // version/copyright as the background, hides the loader) — the same backdrop
  // the login screen uses — and render the card above it. Without this the
  // splash is never dismissed and covers the card, leaving the screen stuck on
  // the loading curtain.
  useEffect(() => {
    (
      globalThis as typeof globalThis & { __enterLoginBackdrop?: () => void }
    ).__enterLoginBackdrop?.();
  }, []);

  return (
    <BAIFlex
      direction="column"
      align="center"
      justify="center"
      style={{ position: 'fixed', inset: 0, zIndex: BAI_Z_INDEX.loginHost }}
    >
      <BAICard title={t('interactiveLogin.InteractiveLoginWithBackendAI')}>
        <BAIFlex direction="column" gap={'sm'} align="stretch">
          {t('interactiveLogin.ConfirmLoginMessage', {
            username: userInfo.username,
            email: userInfo.email,
          })}
          {/* antd `Descriptions` -> `MetadataList` (MAPPING §4).
              `bordered` has no destination (project-wide PILOT-DECISION since
              ticket 20); `column={1}` becomes `columns="single"`. */}
          <BAIMetadataList columns="single">
            <MetadataListItem label={t('interactiveLogin.ServiceName')}>
              {name}
            </MetadataListItem>
            <MetadataListItem label="URL">
              {resolvedCallback ? new URL(resolvedCallback).origin : '-'}
            </MetadataListItem>
          </BAIMetadataList>
          <BAIFlex
            direction="row"
            justify="between"
            style={{ alignSelf: 'stretch' }}
          >
            {
              // @ts-ignore
              globalThis?.backendaiclient?._config
                ?.enableInteractiveLoginAccountSwitch ? (
                <Button
                  size="lg"
                  label={t('interactiveLogin.UseAnotherAccount')}
                  onClick={() => {
                    const event: CustomEvent = new CustomEvent(
                      'backend-ai-logout',
                      {
                        detail: {
                          callbackURL: `${pathname}${search}`,
                        },
                      },
                    );
                    document.dispatchEvent(event);
                  }}
                />
              ) : (
                <div></div>
              )
            }
            <Button
              size="lg"
              variant="primary"
              label={t('login.Login')}
              onClick={() => {
                if (resolvedCallback) {
                  //redirect to callback
                  window.location.href = resolvedCallback;
                }
              }}
            />
          </BAIFlex>
        </BAIFlex>
      </BAICard>
    </BAIFlex>
  );
};

export default InteractiveLoginPage;

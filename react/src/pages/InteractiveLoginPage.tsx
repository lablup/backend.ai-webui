/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { CSSTokenVariables } from '../components/MainLayout/MainLayout';
import { useSuspendedBackendaiClient } from '../hooks';
import { useCurrentUserInfo } from '../hooks/backendai';
import { Button, Card, Descriptions } from 'antd';
import { BAIFlex } from 'backend.ai-ui';
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

  // This route has no MainLayout, so the interactive-login card is its "main
  // UI". Put the splash into login-backdrop mode (keeps the Diagonal Weave +
  // version/copyright as the background, hides the loader) — the same backdrop
  // the login screen uses — and render the card above it. Without this the
  // splash (z-index 10000) is never dismissed and covers the card, leaving the
  // screen stuck on the loading curtain.
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
      style={{ position: 'fixed', inset: 0, zIndex: 10001 }}
    >
      <Card title={t('interactiveLogin.InteractiveLoginWithBackendAI')}>
        <BAIFlex direction="column" gap={'sm'} align="stretch">
          {t('interactiveLogin.ConfirmLoginMessage', {
            username: userInfo.username,
            email: userInfo.email,
          })}
          <Descriptions
            column={1}
            bordered
            items={[
              {
                label: t('interactiveLogin.ServiceName'),
                children: name,
              },
              // {
              //   label: '서비스 설명',
              //   children: (
              //     <BAIFlex style={{ maxWidth: 400 }}>
              //       Backend.AI FastTrack는 Backend.AI를 이용한 MLOps 서비스
              //       입니다.
              //     </BAIFlex>
              //   ),
              // },
              {
                label: 'URL',
                children: callback ? new URL(callback).origin : '-',
              },
            ]}
          />
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
                  size="large"
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
                >
                  {t('interactiveLogin.UseAnotherAccount')}
                </Button>
              ) : (
                <div></div>
              )
            }
            <Button
              size="large"
              type="primary"
              onClick={() => {
                //redirect to callback
                window.location.href = callback || '';
              }}
            >
              {t('login.Login')}
            </Button>
          </BAIFlex>
        </BAIFlex>
      </Card>
    </BAIFlex>
  );
};

export default InteractiveLoginPage;

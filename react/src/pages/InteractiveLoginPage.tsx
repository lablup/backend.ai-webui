import {
  CSSTokenVariables,
  NotificationForAnonymous,
} from '../components/MainLayout/MainLayout';
import { useSuspendedBackendaiClient } from '../hooks';
import { useCurrentUserInfo } from '../hooks/backendai';
import { Button, Card, Descriptions } from 'antd';
import { BAIFlex } from 'backend.ai-ui';
import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { StringParam, useQueryParam } from 'use-query-params';

const InteractiveLoginPage = () => {
  return (
    <>
      <CSSTokenVariables />
      <NotificationForAnonymous />
      <Suspense>
        <Children />
      </Suspense>
    </>
  );
};

const Children = () => {
  useSuspendedBackendaiClient();
  const [userInfo] = useCurrentUserInfo();
  const { pathname, search } = useLocation();
  const [callback] = useQueryParam('callback', StringParam);
  const [name] = useQueryParam('name', StringParam);
  const { t } = useTranslation();

  return (
    <BAIFlex
      direction="column"
      align="center"
      justify="center"
      style={{ height: '100vh' }}
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

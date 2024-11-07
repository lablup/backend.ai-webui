import Flex from '../components/Flex';
import { CSSTokenVariables } from '../components/MainLayout/MainLayout';
import { useSuspendedBackendaiClient } from '../hooks';
import { useCurrentUserInfo } from '../hooks/backendai';
import { Button, Card, Descriptions } from 'antd';
import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { StringParam, useQueryParam } from 'use-query-params';

const InteractiveLoginPage = () => {
  return (
    <>
      <CSSTokenVariables />
      {/* @ts-ignore */}
      <backend-ai-webui id="webui-shell" />
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
    <Flex
      direction="column"
      align="center"
      justify="center"
      style={{ height: '100vh' }}
    >
      <Card title={t('interactiveLogin.InteractiveLoginWithBackendAI')}>
        <Flex direction="column" gap={'sm'} align="stretch">
          {t('interactiveLogin.confirmLoginMessage', {
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
              //     <Flex style={{ maxWidth: 400 }}>
              //       Backend.AI FastTrack는 Backend.AI를 이용한 MLOps 서비스
              //       입니다.
              //     </Flex>
              //   ),
              // },
              {
                label: 'URL',
                children: callback ? new URL(callback).origin : '-',
              },
            ]}
          />
          <Flex
            direction="row"
            justify="between"
            style={{ alignSelf: 'stretch' }}
          >
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
              {t('interactiveLogin.useAnotherAccount')}
            </Button>
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
          </Flex>
        </Flex>
      </Card>
    </Flex>
  );
};

export default InteractiveLoginPage;

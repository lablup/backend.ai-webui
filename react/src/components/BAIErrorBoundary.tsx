import Flex from './Flex';
import { isLoginSessionExpiredState } from './LoginSessionExtendButton';
import { ReloadOutlined } from '@ant-design/icons';
import { Alert, Button, Result, Typography } from 'antd';
import { useAtomValue } from 'jotai';
import React from 'react';
import {
  ErrorBoundary,
  ErrorBoundaryPropsWithRender,
} from 'react-error-boundary';
import { useTranslation } from 'react-i18next';

interface BAIErrorBoundaryProps
  extends Omit<ErrorBoundaryPropsWithRender, 'fallbackRender'> {
  style?: React.CSSProperties;
}

const BAIErrorBoundary: React.FC<BAIErrorBoundaryProps> = ({
  style,
  ...props
}) => {
  const { t } = useTranslation();
  const isExpiredLoginSession = useAtomValue(isLoginSessionExpiredState);
  return (
    <ErrorBoundary
      {...props}
      fallbackRender={({ error, resetErrorBoundary }) => {
        const isLoginSessionExpiredError =
          isExpiredLoginSession ||
          error?.name === 'AuthorizationError' ||
          error?.statusCode === 401;
        return (
          <Flex
            style={{ margin: 'auto', ...style }}
            justify="center"
            align="center"
          >
            <Result
              status="warning"
              title={
                isLoginSessionExpiredError
                  ? t('ErrorBoundary.expiredLoginSessionTitle')
                  : t('ErrorBoundary.title')
              }
              extra={
                <Flex direction="column" gap="md">
                  <Button
                    type="primary"
                    key="console"
                    onClick={() => {
                      // @ts-ignore
                      if (globalThis.isElectron) {
                        globalThis.location.href =
                          // @ts-ignore
                          globalThis.electronInitialHref;
                      } else {
                        globalThis.location.reload();
                      }
                    }}
                    icon={<ReloadOutlined />}
                  >
                    {isLoginSessionExpiredError
                      ? t('ErrorBoundary.expiredLoginSessionReLogin')
                      : t('ErrorBoundary.reloadPage')}
                  </Button>
                  {process.env.NODE_ENV === 'development' && (
                    <Flex
                      direction="column"
                      gap="sm"
                      align="center"
                      style={{ width: '100%' }}
                    >
                      <Alert
                        type="info"
                        showIcon
                        description={
                          <Flex direction="column" align="start" gap={'md'}>
                            <Button
                              type="default"
                              icon={<ReloadOutlined />}
                              onClick={() => {
                                resetErrorBoundary();
                              }}
                            >
                              {t('ErrorBoundary.resetErrorBoundary')}
                            </Button>
                            <Typography.Text>{error.message}</Typography.Text>
                          </Flex>
                        }
                        message={t('ErrorBoundary.displayOnlyDevEnv')}
                      />
                    </Flex>
                  )}
                </Flex>
              }
            ></Result>
          </Flex>
        );
      }}
    />
  );
};

export default BAIErrorBoundary;
export const ErrorView = () => {
  const { t } = useTranslation();
  return (
    <Result
      status="warning"
      title={t('ErrorBoundary.title')}
      extra={
        <Flex direction="column" gap="md">
          <Button
            type="primary"
            key="console"
            onClick={() => {
              // @ts-ignore
              if (globalThis.isElectron) {
                // @ts-ignore
                globalThis.location.href = globalThis.electronInitialHref;
              } else {
                globalThis.location.reload();
              }
            }}
            icon={<ReloadOutlined />}
          >
            {t('ErrorBoundary.reloadPage')}
          </Button>
        </Flex>
      }
    ></Result>
  );
};

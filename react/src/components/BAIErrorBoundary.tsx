import Flex from './Flex';
import { ReloadOutlined } from '@ant-design/icons';
import { Alert, Button, Result, Typography } from 'antd';
import React from 'react';
import {
  ErrorBoundary,
  ErrorBoundaryPropsWithRender,
} from 'react-error-boundary';
import { useTranslation } from 'react-i18next';

interface BAIErrorBoundaryProps
  extends Omit<ErrorBoundaryPropsWithRender, 'fallbackRender'> {}
const BAIErrorBoundary: React.FC<BAIErrorBoundaryProps> = ({ ...props }) => {
  const { t } = useTranslation();
  return (
    <ErrorBoundary
      {...props}
      fallbackRender={({ error, resetErrorBoundary }) => {
        console.error('BAIErrorBoundary', error);
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
                    // resetErrorBoundary();
                    window.location.reload();
                  }}
                  icon={<ReloadOutlined />}
                >
                  {t('ErrorBoundary.reloadPage')}
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
        );
      }}
    />
  );
};

export default BAIErrorBoundary;

import Flex from './Flex';
import { ReloadOutlined } from '@ant-design/icons';
import { Alert, Button, Result, Typography } from 'antd';
import React from 'react';
import {
  ErrorBoundary,
  ErrorBoundaryPropsWithRender,
} from 'react-error-boundary';

interface BAIErrorBoundaryProps
  extends Omit<ErrorBoundaryPropsWithRender, 'fallbackRender'> {}
const BAIErrorBoundary: React.FC<BAIErrorBoundaryProps> = ({ ...props }) => {
  return (
    <ErrorBoundary
      {...props}
      fallbackRender={({ error, resetErrorBoundary }) => {
        console.error('BAIErrorBoundary', error);
        return (
          <Result
            status="warning"
            title="There is a problem with your request."
            extra={
              <Button
                type="primary"
                key="console"
                onClick={() => {
                  // resetErrorBoundary();
                  window.location.reload();
                }}
                icon={<ReloadOutlined />}
              >
                Reload the page
              </Button>
            }
          >
            {process.env.NODE_ENV === 'development' && (
              <Flex direction="column" gap="sm" align="start">
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
                        Reset Error Boundary
                      </Button>
                      <Typography.Text>{error.message}</Typography.Text>
                    </Flex>
                  }
                  message={
                    'This error block is displayed only in WebUI development environment.'
                  }
                />
              </Flex>
            )}
          </Result>
        );
      }}
    />
  );
};

export default BAIErrorBoundary;

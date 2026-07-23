/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Button, Result } from 'antd';
import { BAIFlex, StorageHostFetchError } from 'backend.ai-ui';
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useTranslation } from 'react-i18next';

interface StorageHostFetchErrorBoundaryProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

const StorageHostFetchErrorBoundary: React.FC<
  StorageHostFetchErrorBoundaryProps
> = ({ children, style }) => {
  'use memo';
  const { t } = useTranslation();
  return (
    <ErrorBoundary
      fallbackRender={({ error }) => {
        if (!(error instanceof StorageHostFetchError)) {
          // Re-throw non-storage errors so the outer BAIErrorBoundary handles them.
          throw error;
        }
        return (
          <BAIFlex
            style={{ margin: 'auto', ...style }}
            justify="center"
            align="center"
          >
            <Result
              status="warning"
              title={t('errorBoundary.StorageHostFetchFailedTitle')}
              extra={
                <BAIFlex direction="column" gap="md">
                  <Button
                    type="primary"
                    onClick={() => {
                      globalThis.history.back();
                    }}
                  >
                    {t('button.GoBackToPreviousPage')}
                  </Button>
                </BAIFlex>
              }
            />
          </BAIFlex>
        );
      }}
    >
      {children}
    </ErrorBoundary>
  );
};

export default StorageHostFetchErrorBoundary;

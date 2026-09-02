/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Button } from '@astryxdesign/core/Button';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { BAIFlex, StorageHostFetchError } from 'backend.ai-ui';
import { TriangleAlertIcon } from 'lucide-react';
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
            {/* MAPPING §5: antd `Result` -> `EmptyState` (`subTitle` ->
                `description`, `extra` -> `actions`). `status="warning"` has
                no counterpart beyond an icon you choose — the same
                `TriangleAlertIcon` BAIErrorBoundary settled on. */}
            <EmptyState
              icon={<TriangleAlertIcon size={40} />}
              title={t('errorBoundary.StorageHostFetchFailedTitle')}
              actions={
                <BAIFlex direction="column" gap="md">
                  <Button
                    variant="primary"
                    label={t('button.GoBackToPreviousPage')}
                    onClick={() => {
                      globalThis.history.back();
                    }}
                  />
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

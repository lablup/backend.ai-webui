import { useBAIi18n } from '../hooks/useBAIi18n';
import BAIAlertIconWithTooltip from './BAIAlertIconWithTooltip';
import BAIBoardItemTitle, {
  type BAIBoardItemTitleProps,
} from './BAIBoardItemTitle';
import { useTheme } from '@astryxdesign/core/theme';
import React, { type PropsWithChildren } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

interface BAIBoardItemErrorBoundaryProps extends PropsWithChildren {
  title?: BAIBoardItemTitleProps['title'];
  status?: 'warning' | 'error';
  style?: React.CSSProperties;
}

const BAIBoardItemErrorBoundary: React.FC<BAIBoardItemErrorBoundaryProps> = ({
  title,
  status = 'error',
  children,
  style,
}) => {
  const { t } = useBAIi18n();
  const { token } = useTheme();
  return (
    <ErrorBoundary
      fallbackRender={() => {
        return (
          <div
            data-bai-board-item-status={status}
            style={{
              height: '100%',
              paddingInline: token('--spacing-8'),
              paddingBottom: token('--spacing-4'),
              ...style,
            }}
          >
            <BAIBoardItemTitle
              title={title}
              extra={
                <BAIAlertIconWithTooltip
                  title={t('comp:BAIBoardItemErrorBoundary.UnexpectedError')}
                  type={status}
                />
              }
            />
          </div>
        );
      }}
    >
      {children}
    </ErrorBoundary>
  );
};

export default BAIBoardItemErrorBoundary;

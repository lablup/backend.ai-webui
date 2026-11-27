import { useBAIi18n } from '../hooks/useBAIi18n';
import BAIAlertIconWithTooltip from './BAIAlertIconWithTooltip';
import { useIsInBAIBoardItem } from './BAIBoard';
import BAIBoardItemTitle, {
  type BAIBoardItemTitleProps,
} from './BAIBoardItemTitle';
import { useTheme } from '@lablup/ui-common/theme';
import React, { type PropsWithChildren } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

interface BAIBoardItemErrorBoundaryProps extends PropsWithChildren {
  title?: BAIBoardItemTitleProps['title'];
  status?: 'warning' | 'error';
  style?: React.CSSProperties;
  /** A change in any of these clears a caught error and renders the children again. */
  resetKeys?: Array<unknown>;
}

const BAIBoardItemErrorBoundary: React.FC<BAIBoardItemErrorBoundaryProps> = ({
  title,
  status = 'error',
  children,
  style,
  resetKeys,
}) => {
  const { t } = useBAIi18n();
  const { token } = useTheme();
  const isInBoard = useIsInBAIBoardItem();
  return (
    <ErrorBoundary
      fallbackRender={() => {
        return (
          <div
            data-bai-board-item-status={status}
            style={{
              height: '100%',
              ...(isInBoard
                ? {}
                : {
                    paddingInline: token('--spacing-8'),
                    paddingBottom: token('--spacing-4'),
                  }),
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
      resetKeys={resetKeys}
    >
      {children}
    </ErrorBoundary>
  );
};

export default BAIBoardItemErrorBoundary;

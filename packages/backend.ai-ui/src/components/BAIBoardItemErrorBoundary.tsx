import BAIAlertIconWithTooltip from './BAIAlertIconWithTooltip';
import BAIBoardItemTitle, {
  type BAIBoardItemTitleProps,
} from './BAIBoardItemTitle';
import { theme } from 'antd';
import React, { type PropsWithChildren } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const { token } = theme.useToken();
  return (
    <ErrorBoundary
      fallbackRender={() => {
        return (
          <div
            data-bai-board-item-status={status}
            style={{
              height: '100%',
              paddingInline: token.paddingXL,
              paddingBottom: token.padding,
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

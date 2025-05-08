import { CloseCircleTwoTone, WarningTwoTone } from '@ant-design/icons';
import { Button, Card, CardProps, theme } from 'antd';
import _ from 'lodash';
import React, { ReactNode } from 'react';

export interface BAICardProps extends CardProps {
  status?: 'success' | 'error' | 'warning' | 'default';
  extraButtonTitle?: string | ReactNode;
  showDivider?: boolean;
  onClickExtraButton?: () => void;
  ref?: React.LegacyRef<HTMLDivElement> | undefined;
}

const BAICard: React.FC<BAICardProps> = ({
  status = 'default',
  extraButtonTitle,
  onClickExtraButton,
  extra,
  style,
  styles,
  showDivider,
  ...cardProps
}) => {
  const { token } = theme.useToken();
  const _extra =
    extra ||
    (extraButtonTitle && (
      <Button
        type="link"
        icon={
          status === 'error' ? (
            <CloseCircleTwoTone twoToneColor={token.colorError} />
          ) : status === 'warning' ? (
            <WarningTwoTone twoToneColor={token.colorWarning} />
          ) : undefined
        }
        onClick={onClickExtraButton}
      >
        {extraButtonTitle}
      </Button>
    )) ||
    undefined;
  return (
    <Card
      className={status === 'error' ? 'bai-card-error' : ''}
      style={_.extend(style, {
        borderColor:
          status === 'error'
            ? token.colorError
            : status === 'warning'
              ? token.colorWarning
              : status === 'success'
                ? token.colorSuccess
                : style?.borderColor, // default
      })}
      styles={_.merge(
        showDivider
          ? {}
          : {
              header: {
                borderBottom: 'none',
              },
              body: {
                paddingTop: cardProps.tabList ? token.margin : token.marginXS,
              },
            },
        styles,
      )}
      extra={_extra}
      {...cardProps}
    />
  );
};

export default BAICard;

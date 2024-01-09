import { CloseCircleTwoTone, WarningTwoTone } from '@ant-design/icons';
import { Button, Card, CardProps, theme } from 'antd';
import _ from 'lodash';
import React, { ReactNode } from 'react';

interface BAICardProps extends CardProps {
  status?: 'success' | 'error' | 'warning' | 'default';
  extraButtonTitle?: string | ReactNode;
  onClickExtraButton?: () => void;
}

const BAICard: React.FC<BAICardProps> = ({
  status = 'default',
  extraButtonTitle,
  onClickExtraButton,
  extra,
  style,
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
      extra={_extra}
      {...cardProps}
    />
  );
};

export default BAICard;

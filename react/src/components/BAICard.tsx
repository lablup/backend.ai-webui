import { CloseCircleTwoTone, WarningTwoTone } from '@ant-design/icons';
import { Button, Card, CardProps, theme } from 'antd';
import _ from 'lodash';
import React, { ReactNode } from 'react';

export interface BAICardProps extends CardProps {
  status?: 'success' | 'error' | 'warning' | 'default';
  extraButtonTitle?: string | ReactNode;
  onClickExtraButton?: () => void;
  ref?: React.LegacyRef<HTMLDivElement> | undefined;
  avatar?: string;
}

const BAICard: React.FC<BAICardProps> = ({
  status = 'default',
  extraButtonTitle,
  onClickExtraButton,
  extra,
  style,
  avatar,
  children,
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
  const cardBody = (
    <>
      {avatar && (
        <div style={{ textAlign: 'center', margin: '16px 0' }}>
          <img
            src={avatar}
            alt="Avatar"
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              objectFit: 'cover',
            }}
          />
        </div>
      )}
      {children}
    </>
  );

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
      extra={_extra}
      {...cardProps}
    >
      {cardBody}
    </Card>
  );
};

export default BAICard;

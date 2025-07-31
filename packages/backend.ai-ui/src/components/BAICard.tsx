import Flex from './Flex';
import { CloseCircleTwoTone, WarningTwoTone } from '@ant-design/icons';
import { Button, Card, CardProps, theme } from 'antd';
import _ from 'lodash';
import React, { cloneElement, isValidElement, ReactNode } from 'react';

export interface BAICardProps extends Omit<CardProps, 'extra'> {
  status?: 'success' | 'error' | 'warning' | 'default';
  extra?: ReactNode;
  extraButtonTitle?: string | ReactNode;
  /** Show header divider. Automatically enabled when tabList is specified */
  showDivider?: boolean;
  onClickExtraButton?: () => void;
  ref?: React.Ref<HTMLDivElement> | undefined;
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

  const extraWithoutFontWeight = isValidElement(extra)
    ? cloneElement(extra as React.ReactElement<any>, {
        style: { fontWeight: 'normal' },
      })
    : extra;

  const _extra =
    extraWithoutFontWeight ||
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
        // Auto-enable divider when tabList is specified
        showDivider || cardProps.tabList
          ? {
              body: {
                padding: `${token.padding}px ${token.paddingLG}px ${token.paddingLG}px ${token.paddingLG}px`,
              },
            }
          : {
              header: {
                borderBottom: 'none',
                // Fix: https://app.graphite.dev/github/pr/lablup/backend.ai-webui/3927/feat(FR-878%2C-FR-1228)-My-resource-usage%2Fcapacity?org=lablup#review-PRR_kwDOCRTcws61NwR1
                // Cover the marginBottom issue
                marginBottom: 2,
              },
              body: {
                paddingTop: cardProps.tabList ? token.margin : token.marginXS,
              },
            },
        styles,
      )}
      {...cardProps}
      title={
        cardProps.title || extra ? (
          <Flex
            justify={cardProps.title ? 'between' : 'end'}
            align="center"
            wrap="wrap"
            gap="sm"
            style={{
              marginBlock: token.marginSM,
            }}
          >
            {cardProps.title}
            <Flex>{_extra}</Flex>
          </Flex>
        ) : null
      }
    />
  );
};

export default BAICard;

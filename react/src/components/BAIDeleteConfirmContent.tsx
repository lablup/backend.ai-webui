/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Typography, theme } from 'antd';
import { BAIFlex } from 'backend.ai-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

const MAX_VISIBLE_ITEMS = 5;

interface BAIDeleteConfirmContentProps {
  description?: React.ReactNode;
  itemNames: string[];
  warningMessage?: React.ReactNode;
}

const BAIDeleteConfirmContent: React.FC<BAIDeleteConfirmContentProps> = ({
  description,
  itemNames,
  warningMessage,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const showScrollable = itemNames.length > MAX_VISIBLE_ITEMS;

  return (
    <BAIFlex direction="column" gap="xs" align="stretch">
      {description && <Typography.Text>{description}</Typography.Text>}
      {itemNames.length === 1 ? (
        <Typography.Text strong>{itemNames[0]}</Typography.Text>
      ) : itemNames.length > 1 ? (
        <>
          <Typography.Text type="secondary">
            {t('general.NItems', { count: itemNames.length })}
          </Typography.Text>
          <ul
            style={{
              margin: 0,
              paddingLeft: token.paddingMD,
              listStyle: 'disc',
              ...(showScrollable
                ? {
                    maxHeight: 160,
                    overflowY: 'auto',
                    border: `1px solid ${token.colorBorderSecondary}`,
                    borderRadius: token.borderRadiusSM,
                    padding: token.paddingXS,
                    paddingLeft: token.paddingLG,
                  }
                : {}),
            }}
          >
            {itemNames.map((name, index) => (
              <li key={index}>
                <Typography.Text ellipsis>{name}</Typography.Text>
              </li>
            ))}
          </ul>
        </>
      ) : null}
      {warningMessage && (
        <Typography.Text type="danger">{warningMessage}</Typography.Text>
      )}
    </BAIFlex>
  );
};

export default BAIDeleteConfirmContent;

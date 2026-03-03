import BAIFlex from './BAIFlex';
import { CheckOutlined, CopyOutlined } from '@ant-design/icons';
import { Button, Popover, Tag, theme, Typography } from 'antd';
import _ from 'lodash';
import React, { ReactNode, useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useTranslation } from 'react-i18next';

export interface BAITagListProps {
  items: string[];
  maxInline?: number;
  emptyText?: ReactNode;
  popoverTitle?: ReactNode;
}

const BAITagList: React.FC<BAITagListProps> = ({
  items,
  maxInline = 3,
  emptyText = '-',
  popoverTitle,
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [copied, setCopied] = useState(false);

  const inlineItems = _.slice(items, 0, maxInline);
  const restItems = _.slice(items, maxInline);
  const restCount = _.max([items.length - maxInline, 0]) || 0;

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (items.length === 0) {
    return <>{emptyText}</>;
  }

  return (
    <span>
      <BAIFlex wrap="wrap" gap="xs" style={{ display: 'inline-flex' }}>
        {_.map(inlineItems, (item) => (
          <Tag key={item}>{item}</Tag>
        ))}
      </BAIFlex>
      {restCount > 0 && (
        <>
          &nbsp;
          <Popover
            trigger="click"
            title={
              <BAIFlex justify="between">
                <span>
                  {popoverTitle} ({items.length})
                </span>
                <CopyToClipboard text={items.join(', ')} onCopy={handleCopy}>
                  <Button
                    size="small"
                    type="text"
                    icon={copied ? <CheckOutlined /> : <CopyOutlined />}
                    style={{ color: token.colorLink }}
                  >
                    {copied
                      ? t('general.button.Copied')
                      : t('general.button.CopyAll')}
                  </Button>
                </CopyToClipboard>
              </BAIFlex>
            }
            content={
              <div
                style={{
                  maxHeight: 240,
                  overflow: 'auto',
                  minWidth: 260,
                }}
              >
                <ul style={{ paddingLeft: token.padding, margin: 0 }}>
                  {_.map(restItems, (item) => (
                    <li key={item} style={{ listStyle: 'disc' }}>
                      <Typography.Text>{item}</Typography.Text>
                    </li>
                  ))}
                </ul>
              </div>
            }
          >
            <Typography.Link>+{restCount}</Typography.Link>
          </Popover>
        </>
      )}
    </span>
  );
};

export default BAITagList;

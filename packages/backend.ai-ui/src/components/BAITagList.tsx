import { useBAIi18n } from '../hooks/useBAIi18n';
import BAIFlex from './BAIFlex';
import { CheckOutlined, CopyOutlined } from '@ant-design/icons';
import { Button, Popover, Tag, theme, Tooltip, Typography } from 'antd';
import * as _ from 'lodash-es';
import React, { ReactNode, useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';

export type BAITagListItem = string | number;

export interface BAITagListProps {
  items: ReadonlyArray<BAITagListItem>;
  maxInline?: number;
  emptyText?: ReactNode;
  popoverTitle?: ReactNode;
  /**
   * Visual style of the list.
   * - `'chip'` (default): the first `maxInline` items render as antd `Tag`
   *   chips and the `+N` overflow opens a `Popover` listing the *remaining*
   *   items with a copy-all action. Suited for interactive contexts (modals).
   * - `'text'`: the first `maxInline` items render as inline plain (nowrap)
   *   text and the `+N` overflow is a compact `Tag` whose popup lists *all*
   *   items (no copy-all). Suited for dense table cells.
   *
   * Note the deliberate popup asymmetry: `chip` lists only the overflow
   * (the inline chips are already visible), while `text` lists the full set
   * so the single inline value can be cross-referenced.
   */
  variant?: 'chip' | 'text';
  /**
   * How the overflow popup is triggered. Defaults to `'click'` for the `chip`
   * variant and `'hover'` for the `text` variant.
   */
  trigger?: 'click' | 'hover';
}

const BAITagList: React.FC<BAITagListProps> = ({
  items,
  maxInline = 3,
  emptyText = '-',
  popoverTitle,
  variant = 'chip',
  trigger,
}) => {
  'use memo';
  const { t } = useBAIi18n();
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

  if (variant === 'text') {
    const effectiveTrigger = trigger ?? 'hover';
    // The popup lists ALL items (not just the overflow), matching the dense
    // table-cell overflow pattern.
    const allItemsList = (
      <BAIFlex
        direction="column"
        align="start"
        style={{ maxHeight: 240, overflowY: 'auto' }}
      >
        {_.map(items, (item, index) => (
          <span key={`${item}-${index}`}>{item}</span>
        ))}
      </BAIFlex>
    );
    const overflowTag = (
      <Tag
        color="default"
        style={{
          marginInlineEnd: 0,
          cursor: effectiveTrigger === 'hover' ? 'help' : 'pointer',
        }}
      >
        +{restCount}
      </Tag>
    );

    return (
      <BAIFlex gap="xxs" align="center" style={{ display: 'inline-flex' }}>
        {_.map(inlineItems, (item, index) => (
          <span key={`${item}-${index}`} style={{ whiteSpace: 'nowrap' }}>
            {item}
          </span>
        ))}
        {restCount > 0 &&
          (effectiveTrigger === 'hover' ? (
            <Tooltip title={allItemsList}>{overflowTag}</Tooltip>
          ) : (
            <Popover
              trigger="click"
              title={popoverTitle}
              content={allItemsList}
            >
              {overflowTag}
            </Popover>
          ))}
      </BAIFlex>
    );
  }

  return (
    <span>
      <BAIFlex wrap="wrap" gap="xs" style={{ display: 'inline-flex' }}>
        {_.map(inlineItems, (item, index) => (
          <Tag key={`${item}-${index}`}>{item}</Tag>
        ))}
      </BAIFlex>
      {restCount > 0 && (
        <>
          &nbsp;
          <Popover
            trigger={trigger ?? 'click'}
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
                  {_.map(restItems, (item, index) => (
                    <li key={`${item}-${index}`} style={{ listStyle: 'disc' }}>
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

import { theme } from '../theme-shim';
import BAIFlex from './BAIFlex';
import { Popover, Tag, Tooltip, Typography } from 'antd';
import * as _ from 'lodash-es';
import React, { ReactNode } from 'react';

export type BAITagListItem = string | number;

export interface BAITagListProps {
  items: ReadonlyArray<BAITagListItem>;
  maxInline?: number;
  emptyText?: ReactNode;
  /**
   * Visual style of the list.
   * - `'chip'` (default): the first `maxInline` items render as antd `Tag`
   *   chips and the `+N` overflow opens a `Popover`. Suited for interactive
   *   contexts (modals).
   * - `'text'`: the first `maxInline` items render as inline plain (nowrap)
   *   text and the `+N` overflow is a compact `Tag`. Suited for dense table
   *   cells.
   *
   * Both variants' popups list only the overflowed items — the inline items
   * are already on screen, so repeating them adds nothing.
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
  variant = 'chip',
  trigger,
}) => {
  'use memo';
  const { token } = theme.useToken();

  const inlineItems = _.slice(items, 0, maxInline);
  const restItems = _.slice(items, maxInline);
  const restCount = restItems.length;
  const effectiveTrigger = trigger ?? (variant === 'text' ? 'hover' : 'click');

  if (items.length === 0) {
    return <>{emptyText}</>;
  }

  if (variant === 'text') {
    const renderOverflow = () => {
      const restItemsList = (
        <BAIFlex
          direction="column"
          align="start"
          style={{ maxHeight: 240, overflowY: 'auto' }}
        >
          {_.map(restItems, (item, index) => (
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

      return effectiveTrigger === 'hover' ? (
        <Tooltip title={restItemsList}>{overflowTag}</Tooltip>
      ) : (
        <Popover trigger="click" content={restItemsList}>
          {overflowTag}
        </Popover>
      );
    };

    return (
      <BAIFlex gap="xxs" align="center" style={{ display: 'inline-flex' }}>
        {_.map(inlineItems, (item, index) => (
          <span key={`${item}-${index}`} style={{ whiteSpace: 'nowrap' }}>
            {item}
          </span>
        ))}
        {restCount > 0 && renderOverflow()}
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
            trigger={effectiveTrigger}
            content={
              <ul
                style={{
                  paddingLeft: token.padding,
                  margin: 0,
                  maxHeight: 240,
                  overflow: 'auto',
                }}
              >
                {_.map(restItems, (item, index) => (
                  <li key={`${item}-${index}`} style={{ listStyle: 'disc' }}>
                    <Typography.Text>{item}</Typography.Text>
                  </li>
                ))}
              </ul>
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

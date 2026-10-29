/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useBAIi18n } from '../hooks/useBAIi18n';
import './BAIDynamicList.css';
import { Button } from '@lablup/ui-common/Button';
import { IconButton } from '@lablup/ui-common/IconButton';
import * as _ from 'lodash-es';
import { PlusIcon, XIcon } from 'lucide-react';
import React from 'react';

export interface BAIDynamicListColumn<T> {
  key: string;
  /** Shown once, above the first row. */
  header: React.ReactNode;
  /** A number is a share of the free width (`fr`); a string is a CSS track size. */
  width?: number | string;
  render: (item: T, index: number) => React.ReactNode;
}

export interface BAIDynamicListProps<T> extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'children'
> {
  columns: BAIDynamicListColumn<T>[];
  items: T[];
  getItemKey: (item: T, index: number) => React.Key;
  onAdd: () => void;
  onRemove: (item: T, index: number) => void;
  addLabel: string;
  disabled?: boolean;
  maxItems?: number;
}

const toTrack = (width: number | string | undefined) =>
  typeof width === 'string' ? width : `minmax(0, ${width ?? 1}fr)`;

/**
 * Rows of the same fields with Add and Remove actions. It owns no form state:
 * each column's `render` returns the cell, `Form.Item` included.
 */
const BAIDynamicList = <T,>({
  columns,
  items,
  getItemKey,
  onAdd,
  onRemove,
  addLabel,
  disabled,
  maxItems,
  className,
  ...divProps
}: BAIDynamicListProps<T>) => {
  'use memo';
  const { t } = useBAIi18n();
  const removeLabel = t('general.button.Remove');
  const gridTemplateColumns = `${_.map(columns, (c) => toTrack(c.width)).join(' ')} auto`;
  return (
    <div
      {...divProps}
      className={_.compact(['bai-dynamic-list', className]).join(' ')}
      data-bai-dynamic-list=""
    >
      {items.length > 0 && (
        <div
          className="bai-dynamic-list__row"
          style={{ gridTemplateColumns }}
          data-bai-dynamic-list-header=""
          aria-hidden
        >
          {_.map(columns, (column) => (
            <span
              key={column.key}
              className="bai-dynamic-list__header"
              data-bai-dynamic-list-column-header={column.key}
            >
              {column.header}
            </span>
          ))}
          <span className="bai-dynamic-list__remove-slot" />
        </div>
      )}
      {_.map(items, (item, index) => (
        <div
          key={getItemKey(item, index)}
          className="bai-dynamic-list__row"
          style={{ gridTemplateColumns }}
          data-bai-dynamic-list-row={index}
        >
          {_.map(columns, (column) => (
            <div
              key={column.key}
              className="bai-dynamic-list__cell"
              data-bai-dynamic-list-cell={column.key}
            >
              {column.render(item, index)}
            </div>
          ))}
          <IconButton
            variant="ghost"
            label={removeLabel}
            tooltip={removeLabel}
            icon={<XIcon size="1em" />}
            isDisabled={disabled}
            onClick={() => onRemove(item, index)}
          />
        </div>
      ))}
      <Button
        variant="secondary"
        label={addLabel}
        icon={<PlusIcon size="1em" />}
        isDisabled={
          disabled || (maxItems !== undefined && items.length >= maxItems)
        }
        onClick={onAdd}
      />
    </div>
  );
};

export default BAIDynamicList;

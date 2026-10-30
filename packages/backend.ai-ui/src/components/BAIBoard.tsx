/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Adapter over ui-common `Board`: keeps the frozen `movable` / `resizable` /
 `bordered` names and the `onItemsChange({ detail })` shape the dashboards
 read. An item without its own `title` / `description` gets `data.content` as
 the description; ui-common `Board` moves its first `BAIBoardItemTitle` into the header.
*/
import './BAIBoard.css';
import {
  Board,
  type BoardItem,
  type BoardItemsChangeDetail,
  type BoardProps,
} from '@lablup/ui-common/components/Board';
import classNames from 'classnames';
import * as _ from 'lodash-es';
import React from 'react';

export interface BAIBoardDataType {
  content?: React.ReactNode;
}

export type BAIBoardItem<T extends BAIBoardDataType = BAIBoardDataType> =
  BoardItem<T>;

export interface BAIBoardItemsChangeEvent<
  T extends BAIBoardDataType = BAIBoardDataType,
> {
  detail: BoardItemsChangeDetail<T>;
}

export interface BAIBoardProps<
  T extends BAIBoardDataType = BAIBoardDataType,
> extends Omit<
  BoardProps<T>,
  'items' | 'onItemsChange' | 'isMovable' | 'isResizable' | 'variant'
> {
  items: Array<BAIBoardItem<T>>;
  onItemsChange: (event: BAIBoardItemsChangeEvent<T>) => void;
  movable?: boolean;
  resizable?: boolean;
  bordered?: boolean;
}

const hasOwnSlots = (item: BAIBoardItem<BAIBoardDataType>) =>
  item.title !== undefined || item.description !== undefined;

const BAIBoard = <T extends BAIBoardDataType = BAIBoardDataType>({
  items,
  onItemsChange,
  movable = false,
  resizable = false,
  bordered = false,
  className,
  ...boardProps
}: BAIBoardProps<T>) => {
  'use memo';
  const ownSlotIds = new Set(
    items.filter((item) => hasOwnSlots(item)).map((item) => item.id),
  );
  return (
    <Board<T>
      {...boardProps}
      className={classNames('bai-board', className)}
      items={items.map((item) =>
        hasOwnSlots(item) ? item : { ...item, description: item.data?.content },
      )}
      // Hand back the items as given: the description added here is rebuilt on every render.
      onItemsChange={(detail) => {
        const strip = <I extends BAIBoardItem<T> | undefined>(item: I): I =>
          item && !ownSlotIds.has(item.id)
            ? (_.omit(item, 'description') as I)
            : item;
        onItemsChange({
          detail: {
            ...detail,
            items: detail.items.map(strip),
            movedItem: strip(detail.movedItem),
            resizedItem: strip(detail.resizedItem),
          },
        });
      }}
      isMovable={movable}
      isResizable={resizable}
      variant={bordered ? 'bordered' : 'plain'}
    />
  );
};

BAIBoard.displayName = 'BAIBoard';

export default BAIBoard;

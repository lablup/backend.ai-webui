/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Adapter over ui-common `Board`: keeps the frozen `movable` / `resizable` /
 `bordered` names and the `onItemsChange({ detail })` shape the dashboards read,
 and renders `item.data.content` unless a `renderItem` is given.
*/
import './BAIBoard.css';
import {
  Board,
  type BoardItem,
  type BoardItemsChangeDetail,
  type BoardProps,
} from '@lablup/ui-common/components/Board';
import classNames from 'classnames';
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
  | 'items'
  | 'renderItem'
  | 'onItemsChange'
  | 'isMovable'
  | 'isResizable'
  | 'variant'
> {
  items: Array<BAIBoardItem<T>>;
  onItemsChange: (event: BAIBoardItemsChangeEvent<T>) => void;
  /** @default (item) => item.data?.content */
  renderItem?: BoardProps<T>['renderItem'];
  movable?: boolean;
  resizable?: boolean;
  bordered?: boolean;
}

const BAIBoard = <T extends BAIBoardDataType = BAIBoardDataType>({
  items,
  onItemsChange,
  renderItem = (item) => item.data?.content,
  movable = false,
  resizable = false,
  bordered = false,
  className,
  ...boardProps
}: BAIBoardProps<T>) => {
  'use memo';
  return (
    <Board<T>
      {...boardProps}
      className={classNames('bai-board', className)}
      items={items}
      renderItem={renderItem}
      onItemsChange={(detail) => onItemsChange({ detail })}
      isMovable={movable}
      isResizable={resizable}
      variant={bordered ? 'bordered' : 'plain'}
    />
  );
};

BAIBoard.displayName = 'BAIBoard';
export default BAIBoard;

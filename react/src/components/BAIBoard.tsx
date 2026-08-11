/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import './BAIBoard.css';
import Board, { BoardProps } from '@cloudscape-design/board-components/board';
import BoardItem from '@cloudscape-design/board-components/board-item';
import classNames from 'classnames';

export interface BAIBoardDataType {
  content?: React.ReactNode;
}

export type BAIBoardItem = BoardProps.Item<BAIBoardDataType>;
export interface BAIBoardProps<T extends BAIBoardDataType = BAIBoardDataType> {
  items: Array<BoardProps.Item<T>>;
  onItemsChange: (event: CustomEvent<BoardProps.ItemsChangeDetail<T>>) => void;
  resizable?: boolean;
  movable?: boolean;
  bordered?: boolean;
}

const BAIBoard = <T extends BAIBoardDataType>({
  items,
  resizable = false,
  movable = false,
  bordered = false,
  ...BoardProps
}: BAIBoardProps<T>) => {
  return (
    <Board<T>
      className={classNames(
        'bai-board',
        !movable && 'bai-board-disable-move',
        !resizable && 'bai-board-disable-resize',
      )}
      empty
      renderItem={(item: BoardProps.Item<T>) => {
        return (
          <BoardItem
            className={classNames(
              'bai-board-item',
              !bordered && 'bai-board-item-disable-border',
            )}
            key={item.id}
            i18nStrings={{
              dragHandleAriaLabel: '',
              dragHandleAriaDescription: '',
              resizeHandleAriaLabel: '',
              resizeHandleAriaDescription: '',
            }}
            {...item}
          >
            {item?.data?.content}
          </BoardItem>
        );
      }}
      items={items}
      i18nStrings={(() => {
        const createAnnouncement = (
          operationAnnouncement: any,
          conflicts: any,
          disturbed: any,
        ) => {
          const conflictsAnnouncement =
            conflicts.length > 0
              ? `Conflicts with ${conflicts
                  .map((c: any) => c.data.title)
                  .join(', ')}.`
              : '';
          const disturbedAnnouncement =
            disturbed.length > 0 ? `Disturbed ${disturbed.length} items.` : '';
          return [
            operationAnnouncement,
            conflictsAnnouncement,
            disturbedAnnouncement,
          ]
            .filter(Boolean)
            .join(' ');
        };
        return {
          liveAnnouncementDndStarted: (operationType) =>
            operationType === 'resize' ? 'Resizing' : 'Dragging',
          liveAnnouncementDndItemReordered: (operation) => {
            const columns = `column ${operation.placement.x + 1}`;
            const rows = `row ${operation.placement.y + 1}`;
            return createAnnouncement(
              `Item moved to ${
                operation.direction === 'horizontal' ? columns : rows
              }.`,
              operation.conflicts,
              operation.disturbed,
            );
          },
          liveAnnouncementDndItemResized: (operation) => {
            const columnsConstraint = operation.isMinimalColumnsReached
              ? ' (minimal)'
              : '';
            const rowsConstraint = operation.isMinimalRowsReached
              ? ' (minimal)'
              : '';
            const sizeAnnouncement =
              operation.direction === 'horizontal'
                ? `columns ${operation.placement.width}${columnsConstraint}`
                : `rows ${operation.placement.height}${rowsConstraint}`;
            return createAnnouncement(
              `Item resized to ${sizeAnnouncement}.`,
              operation.conflicts,
              operation.disturbed,
            );
          },
          liveAnnouncementDndItemInserted: (operation) => {
            const columns = `column ${operation.placement.x + 1}`;
            const rows = `row ${operation.placement.y + 1}`;
            return createAnnouncement(
              `Item inserted to ${columns}, ${rows}.`,
              operation.conflicts,
              operation.disturbed,
            );
          },
          liveAnnouncementDndCommitted: (operationType) =>
            `${operationType} committed`,
          liveAnnouncementDndDiscarded: (operationType) =>
            `${operationType} discarded`,
          liveAnnouncementItemRemoved: (op: any) =>
            createAnnouncement(
              `Removed item ${op.item.data.title}.`,
              [],
              op.disturbed,
            ),
          navigationAriaLabel: 'Board navigation',
          navigationAriaDescription:
            'Click on non-empty item to move focus over',
          navigationItemAriaLabel: (item: any) =>
            item ? item.data.title : 'Empty',
        };
      })()}
      {...BoardProps}
    />
  );
};

export default BAIBoard;

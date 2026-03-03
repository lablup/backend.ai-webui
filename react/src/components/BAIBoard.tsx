/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import Board, { BoardProps } from '@cloudscape-design/board-components/board';
import BoardItem from '@cloudscape-design/board-components/board-item';
import { createStyles } from 'antd-style';
import classNames from 'classnames';

const useStyles = createStyles(({ css, token }) => {
  return {
    board: css`
      .bai_board_placeholder {
        border-radius: var(--token-borderRadius) !important;
      }
      .bai_board_placeholder--active {
        background-color: var(--token-colorSplit) !important ;
      }
      .bai_board_placeholder--hover {
        background-color: var(--token-colorPrimaryHover) !important ;
        // FIXME: global token doesn't exist, so opacity fits color
        opacity: 0.3;
      }
      .bai_board_handle button span {
        color: ${token.colorTextQuaternary} !important;
        padding-left: 5px !important;
      }
      .bai_board_header {
        padding: 0 !important;
        padding-top: ${token.padding - 1}px !important;
      }
      .bai_board_resizer button span {
        color: ${token.colorTextQuaternary} !important;
      }
      .bai_board_container-override
        > div:first-child
        > div:nth-child(2)
        > div:first-child {
        padding: 0 !important;
      }
    `,
    disableResize: css`
      .bai_board_resizer {
        display: none !important;
      }
    `,
    disableMove: css`
      .bai_board_handle {
        display: none !important;
      }
      .bai_board_header {
        display: none !important;
      }
    `,
    boardItems: css`
      & > div:first-child {
        border-radius: var(--token-borderRadius) !important;
        background-color: var(--token-colorBgContainer) !important;
        border: 1px solid ${token.colorBorderSecondary} !important;
      }

      & > div:first-child > div:first-child > div:first-child {
        margin-bottom: var(--token-margin);
        background-color: var(--token-colorBgContainer) !important;
        position: absolute;
        z-index: 1;
      }
    `,
    disableBorder: css`
      & > div:first-child {
        border: none !important;
      }
    `,
  };
});

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
  const { styles } = useStyles();
  return (
    <Board<T>
      className={classNames(
        styles.board,
        !movable && styles.disableMove,
        !resizable && styles.disableResize,
      )}
      empty
      renderItem={(item: BoardProps.Item<T>) => {
        return (
          <BoardItem
            className={classNames(
              styles.boardItems,
              !bordered && styles.disableBorder,
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

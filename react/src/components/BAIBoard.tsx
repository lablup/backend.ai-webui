import Flex from './Flex';
import Board, { BoardProps } from '@cloudscape-design/board-components/board';
import BoardItem from '@cloudscape-design/board-components/board-item';
import { Skeleton, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { Suspense } from 'react';

const useStyles = createStyles(({ css }) => ({
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
  `,
  boardItem: css`
    & > div:first-child {
      border: 1px solid var(--token-colorBorder) !important ;
      border-radius: var(--token-borderRadius) !important ;
      background-color: var(--token-colorBgContainer) !important ;
    }

    & > div:first-child > div:first-child > div:first-child {
      border-bottom: 1px solid var(--token-colorBorder) !important;
      margin-bottom: var(--token-margin);
      background-color: var(--token-colorBgContainer) !important ;
    }
  `,
}));

interface BAICustomizableGridProps {
  items: Array<BoardProps.Item>;
  onItemsChange: (
    event: CustomEvent<BoardProps.ItemsChangeDetail<unknown>>,
  ) => void;
}

const BAIBoard: React.FC<BAICustomizableGridProps> = ({
  items: parsedItems,
  ...BoardProps
}) => {
  const { styles } = useStyles();
  return (
    <Board
      //@ts-ignore
      className={styles.board}
      empty
      renderItem={(item: any) => {
        return (
          <BoardItem
            //@ts-ignore
            className={styles.boardItem}
            key={item.id}
            i18nStrings={{
              dragHandleAriaLabel: '',
              dragHandleAriaDescription: '',
              resizeHandleAriaLabel: '',
              resizeHandleAriaDescription: '',
            }}
            header={
              <Flex style={{ height: '100%' }} align="center">
                <Typography.Text strong>{item.data.title}</Typography.Text>
              </Flex>
            }
          >
            <Suspense fallback={<Skeleton active />}>
              {item.data.content}
            </Suspense>
          </BoardItem>
        );
      }}
      items={parsedItems}
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

import { BoardItem, BoardItemsChangeDetail, BoardProps } from '@lablup/ui-common/components/Board';
import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
export interface BAIBoardDataType {
    content?: React.ReactNode;
}
export type BAIBoardItem<T extends BAIBoardDataType = BAIBoardDataType> = BoardItem<T>;
export interface BAIBoardItemsChangeEvent<T extends BAIBoardDataType = BAIBoardDataType> {
    detail: BoardItemsChangeDetail<T>;
}
export interface BAIBoardProps<T extends BAIBoardDataType = BAIBoardDataType> extends Omit<BoardProps<T>, 'items' | 'renderItem' | 'onItemsChange' | 'isMovable' | 'isResizable' | 'variant'> {
    items: Array<BAIBoardItem<T>>;
    onItemsChange: (event: BAIBoardItemsChangeEvent<T>) => void;
    /** @default (item) => item.data?.content */
    renderItem?: BoardProps<T>['renderItem'];
    movable?: boolean;
    resizable?: boolean;
    bordered?: boolean;
}
declare const BAIBoard: {
    <T extends BAIBoardDataType = BAIBoardDataType>({ items, onItemsChange, renderItem, movable, resizable, bordered, className, ...boardProps }: BAIBoardProps<T>): React.JSX.Element;
    displayName: string;
};
export default BAIBoard;

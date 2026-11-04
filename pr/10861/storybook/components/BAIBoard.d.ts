import { BoardItem, BoardItemsChangeDetail, BoardProps } from '@lablup/ui-common/components/Board';
import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.3.1/389d2ab16b7e9a891f1811154c26db12b2fd74e8cb0d60e295d30c107a842d5d/node_modules/react';
export interface BAIBoardDataType {
    content?: React.ReactNode;
}
export type BAIBoardItem<T extends BAIBoardDataType = BAIBoardDataType> = BoardItem<T>;
export interface BAIBoardItemsChangeEvent<T extends BAIBoardDataType = BAIBoardDataType> {
    detail: BoardItemsChangeDetail<T>;
}
export interface BAIBoardProps<T extends BAIBoardDataType = BAIBoardDataType> extends Omit<BoardProps<T>, 'items' | 'onItemsChange' | 'isMovable' | 'isResizable' | 'variant'> {
    items: Array<BAIBoardItem<T>>;
    onItemsChange: (event: BAIBoardItemsChangeEvent<T>) => void;
    movable?: boolean;
    resizable?: boolean;
    bordered?: boolean;
}
declare const BAIBoard: {
    <T extends BAIBoardDataType = BAIBoardDataType>({ items, onItemsChange, movable, resizable, bordered, className, ...boardProps }: BAIBoardProps<T>): React.JSX.Element;
    displayName: string;
};
export default BAIBoard;

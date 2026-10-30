import { default as React } from '../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
export interface BAIDynamicListColumn<T> {
    key: string;
    /** Shown once, above the first row. */
    header: React.ReactNode;
    /** A number is a share of the free width (`fr`); a string is a CSS track size. */
    width?: number | string;
    render: (item: T, index: number) => React.ReactNode;
}
export interface BAIDynamicListAddButton {
    onClick: () => void;
    label: string;
}
export interface BAIDynamicListProps<T extends {
    key: React.Key;
}> extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
    columns: BAIDynamicListColumn<T>[];
    items: T[];
    onRemove: (item: T, index: number) => void;
    addButton: BAIDynamicListAddButton;
    disabled?: boolean;
    maxItems?: number;
}
/**
 * Rows of the same fields with Add and Remove actions. It owns no form state:
 * each column's `render` returns the cell, `Form.Item` included.
 */
declare const BAIDynamicList: <T extends {
    key: React.Key;
}>({ columns, items, onRemove, addButton, disabled, maxItems, className, ...divProps }: BAIDynamicListProps<T>) => React.JSX.Element;
export default BAIDynamicList;

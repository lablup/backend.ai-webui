import { Meta, Rule, StoreValue } from './interface';
import { NamePath } from './namePath';
import * as React from 'react';
export interface ListField {
    name: number;
    key: number;
    isListField: boolean;
}
export interface ListOperations {
    add: (defaultValue?: StoreValue, insertIndex?: number) => void;
    remove: (index: number | number[]) => void;
}
export interface ListProps {
    name: NamePath;
    rules?: Rule[];
    validateTrigger?: string | string[] | false;
    initialValue?: any[];
    isListField?: boolean;
    children: (fields: ListField[], operations: ListOperations, meta: Meta) => React.ReactNode;
}
declare const List: React.FC<ListProps>;
export default List;

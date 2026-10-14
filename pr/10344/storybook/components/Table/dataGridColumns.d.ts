import { BAIAnyObject, BAIColumnType, BAIColumnsType } from './tableTypes';
import { DataGridColumn } from '@lablup/ui-common/components/DataGrid';
import { ReactNode } from '../../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
type AnyRecord = BAIAnyObject;
/** `sortKey` override, else the `dataIndex` path joined with `.`, else the key. */
export declare const sortKeyOf: (column: BAIColumnType<any>, key: string) => string;
export interface FlatColumn<RecordType> {
    key: string;
    column: BAIColumnType<RecordType>;
    groupTitle?: ReactNode;
}
/** Column groups flatten to their leaves; nested group titles join with ` / `. */
export declare const flattenColumns: <RecordType extends AnyRecord>(columns: BAIColumnsType<RecordType> | undefined, groupTitle?: ReactNode) => Array<FlatColumn<RecordType>>;
/** BAITable columns, flattened, as DataGrid columns. */
export declare const toDataGridColumns: <RecordType extends AnyRecord>(flatColumns: Array<FlatColumn<RecordType>>, { isClientSorted, isPinning, }?: {
    isClientSorted?: boolean;
    isPinning?: boolean;
}) => Array<DataGridColumn<RecordType>>;
export {};

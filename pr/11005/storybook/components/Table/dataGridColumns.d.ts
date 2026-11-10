import { BAIAnyObject, BAIColumnType, BAIColumnsType } from './tableTypes';
import { DataGridColumn } from '@lablup/ui-common/components/DataGrid';
import { ReactNode } from '../../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.3.1/389d2ab16b7e9a891f1811154c26db12b2fd74e8cb0d60e295d30c107a842d5d/node_modules/react';
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

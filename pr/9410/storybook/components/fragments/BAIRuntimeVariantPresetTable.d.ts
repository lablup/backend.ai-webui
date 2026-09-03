import { BAIRuntimeVariantPresetTableFragment$data, BAIRuntimeVariantPresetTableFragment$key } from '../../__generated__/BAIRuntimeVariantPresetTableFragment.graphql';
import { BAIColumnsType, BAITableProps } from '../Table';
export type RuntimeVariantPresetNodeInList = NonNullable<BAIRuntimeVariantPresetTableFragment$data[number]>;
export declare const availablePresetSorterValues: readonly ["name", "rank", "createdAt", ...("-createdAt" | "-name" | "-rank")[]];
export interface BAIRuntimeVariantPresetTableProps extends Omit<BAITableProps<RuntimeVariantPresetNodeInList>, 'dataSource' | 'columns' | 'onChangeOrder'> {
    presetsFrgmt: BAIRuntimeVariantPresetTableFragment$key;
    customizeColumns?: (baseColumns: BAIColumnsType<RuntimeVariantPresetNodeInList>) => BAIColumnsType<RuntimeVariantPresetNodeInList>;
    disableSorter?: boolean;
    onChangeOrder?: (order: (typeof availablePresetSorterValues)[number] | null) => void;
}
declare const BAIRuntimeVariantPresetTable: ({ presetsFrgmt, customizeColumns, disableSorter, onChangeOrder, ...tableProps }: BAIRuntimeVariantPresetTableProps) => import("react").JSX.Element;
export default BAIRuntimeVariantPresetTable;

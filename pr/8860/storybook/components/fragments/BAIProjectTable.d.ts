import { BAIProjectTableFragment$data, BAIProjectTableFragment$key } from '../../__generated__/BAIProjectTableFragment.graphql';
import { BAIColumnsType, BAITableProps } from '../Table';
export declare const availableProjectSorterKeys: readonly ["name", "id", "domain_name", "created_at", "is_active", "resource_policy"];
export declare const availableProjectSorterValues: readonly ["name", "id", "domain_name", "created_at", "is_active", "resource_policy", ...("-resource_policy" | "-domain_name" | "-created_at" | "-id" | "-name" | "-is_active")[]];
export type ProjectInList = NonNullable<NonNullable<BAIProjectTableFragment$data>[number]>;
export interface BAIProjectTableProps extends Omit<BAITableProps<ProjectInList>, 'dataSource' | 'columns' | 'rowKey' | 'onChangeOrder'> {
    projectFragment: BAIProjectTableFragment$key;
    /**
     * Customize the base columns (insert, filter, reorder, or override a
     * column's `render`). Receives the base columns array and returns the
     * modified array. The page composes the per-row action list (edit /
     * deactivate / activate / purge) by overriding the `name` column's
     * `render` here, so the action logic stays in the app layer rather than
     * being injected through individual callback props.
     */
    customizeColumns?: (baseColumns: BAIColumnsType<ProjectInList>) => BAIColumnsType<ProjectInList>;
    onChangeOrder?: (order: (typeof availableProjectSorterValues)[number] | null) => void;
}
declare const BAIProjectTable: ({ projectFragment, customizeColumns, onChangeOrder, ...tableProps }: BAIProjectTableProps) => import("react").JSX.Element;
export default BAIProjectTable;

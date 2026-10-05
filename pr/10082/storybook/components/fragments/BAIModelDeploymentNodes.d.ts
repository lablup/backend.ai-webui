import { BAIModelDeploymentNodesFragment$data, BAIModelDeploymentNodesFragment$key } from '../../__generated__/BAIModelDeploymentNodesFragment.graphql';
import { BAIColumnsType, BAITableProps } from '../Table';
import { default as React } from '../../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
export type ModelDeploymentNodeInList = NonNullable<BAIModelDeploymentNodesFragment$data[number]>;
/**
 * Sortable column keys, in the same camelCase form every other table uses
 * (see `AdminDeploymentPresetTable`). A sortable column's `dataIndex` matches
 * an entry here, and callers bridge these strings to the server
 * `DeploymentOrderField` enum with the shared `convertToOrderBy` helper
 * (`createdAt` → `CREATED_AT`, `tag` → `TAG`, …). `updatedAt` is
 * intentionally omitted because the server enum does not include it.
 */
export declare const availableDeploymentSorterKeys: readonly ["name", "createdAt", "domain", "project", "resourceGroup", "tag"];
export type DeploymentSorterKey = (typeof availableDeploymentSorterKeys)[number];
export declare const availableDeploymentSorterValues: readonly ["name", "createdAt", "domain", "project", "resourceGroup", "tag", ...("-createdAt" | "-name" | "-tag" | "-project" | "-resourceGroup" | "-domain")[]];
export type DeploymentOrderValue = (typeof availableDeploymentSorterValues)[number];
export interface BAIModelDeploymentNodesProps extends Omit<BAITableProps<ModelDeploymentNodeInList>, 'dataSource' | 'columns' | 'onChangeOrder'> {
    deploymentsFrgmt: BAIModelDeploymentNodesFragment$key;
    customizeColumns?: (baseColumns: BAIColumnsType<ModelDeploymentNodeInList>) => BAIColumnsType<ModelDeploymentNodeInList>;
    disableSorter?: boolean;
    /**
     * Which columns may be sorted. Defaults to every key the current server enum
     * has; a caller on an older manager narrows it (`DOMAIN`/`PROJECT`/
     * `RESOURCE_GROUP`/`TAG` only exist from 26.4.3).
     */
    sortableKeys?: ReadonlyArray<DeploymentSorterKey>;
    onChangeOrder?: (order: (typeof availableDeploymentSorterValues)[number] | null) => void;
}
declare const BAIModelDeploymentNodes: React.FC<BAIModelDeploymentNodesProps>;
export default BAIModelDeploymentNodes;

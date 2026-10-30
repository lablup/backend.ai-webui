import { BAIModelDeploymentNodesFragment$data, BAIModelDeploymentNodesFragment$key } from '../../__generated__/BAIModelDeploymentNodesFragment.graphql';
import { BAIColumnsType, BAITableProps } from '../Table';
import { BAIEntityLabel } from './BAIEntityLabelTokens';
import { default as React } from '../../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.3.1/389d2ab16b7e9a891f1811154c26db12b2fd74e8cb0d60e295d30c107a842d5d/node_modules/react';
export type ModelDeploymentNodeInList = NonNullable<BAIModelDeploymentNodesFragment$data[number]>;
/**
 * Sortable column keys, in the same camelCase form every other table uses
 * (see `AdminDeploymentPresetTable`). A sortable column's `dataIndex` matches
 * an entry here, and callers bridge these strings to the server
 * `DeploymentOrderField` enum with the shared `convertToOrderBy` helper
 * (`createdAt` → `CREATED_AT`, `resourceGroup` → `RESOURCE_GROUP`, …). `updatedAt` is
 * intentionally omitted because the server enum does not include it.
 */
export declare const availableDeploymentSorterKeys: readonly ["name", "createdAt", "project", "resourceGroup", "desiredReplicas"];
export type DeploymentSorterKey = (typeof availableDeploymentSorterKeys)[number];
export declare const availableDeploymentSorterValues: readonly ["name", "createdAt", "project", "resourceGroup", "desiredReplicas", ...("-createdAt" | "-name" | "-resourceGroup" | "-project" | "-desiredReplicas")[]];
export type DeploymentOrderValue = (typeof availableDeploymentSorterValues)[number];
export interface BAIModelDeploymentNodesProps extends Omit<BAITableProps<ModelDeploymentNodeInList>, 'dataSource' | 'columns' | 'onChangeOrder'> {
    deploymentsFrgmt: BAIModelDeploymentNodesFragment$key;
    customizeColumns?: (baseColumns: BAIColumnsType<ModelDeploymentNodeInList>) => BAIColumnsType<ModelDeploymentNodeInList>;
    disableSorter?: boolean;
    onChangeOrder?: (order: (typeof availableDeploymentSorterValues)[number] | null) => void;
    /** Adds "Edit labels" to the Labels column's hover actions. */
    onEditLabels?: (deployment: ModelDeploymentNodeInList) => void;
    onLabelClick?: (label: BAIEntityLabel) => void;
    /** Shows the Labels column at the start; otherwise it starts hidden, revealed from the column settings. */
    showLabelsByDefault?: boolean;
}
declare const BAIModelDeploymentNodes: React.FC<BAIModelDeploymentNodesProps>;
export default BAIModelDeploymentNodes;

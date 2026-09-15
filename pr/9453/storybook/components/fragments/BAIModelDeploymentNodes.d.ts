import { BAIModelDeploymentNodesFragment$data, BAIModelDeploymentNodesFragment$key } from '../../__generated__/BAIModelDeploymentNodesFragment.graphql';
import { BAIColumnsType, BAITableProps } from '../Table';
import { default as React } from '../../../../../../../../setup-pnpm/node_modules/.bin/store/v11/links/@/react/19.2.8/01dc110d7f872a8caacc052aa0e86f46609c662315b6d5b76a7913331f487dd1/node_modules/react';
export type ModelDeploymentNodeInList = NonNullable<BAIModelDeploymentNodesFragment$data[number]>;
export declare const availableDeploymentSorterValues: readonly ["name", "createdAt", "domain", "project", "resourceGroup", "tag", ...("-createdAt" | "-name" | "-tag" | "-project" | "-resourceGroup" | "-domain")[]];
export type DeploymentOrderValue = (typeof availableDeploymentSorterValues)[number];
export interface BAIModelDeploymentNodesProps extends Omit<BAITableProps<ModelDeploymentNodeInList>, 'dataSource' | 'columns' | 'onChangeOrder'> {
    deploymentsFrgmt: BAIModelDeploymentNodesFragment$key;
    customizeColumns?: (baseColumns: BAIColumnsType<ModelDeploymentNodeInList>) => BAIColumnsType<ModelDeploymentNodeInList>;
    disableSorter?: boolean;
    onChangeOrder?: (order: (typeof availableDeploymentSorterValues)[number] | null) => void;
}
declare const BAIModelDeploymentNodes: React.FC<BAIModelDeploymentNodesProps>;
export default BAIModelDeploymentNodes;

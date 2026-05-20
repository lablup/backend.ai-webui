/**
 * @generated SignedSource<<f19d13bface87818f81fd08742e5bc86>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type DeploymentStrategyType = "BLUE_GREEN" | "ROLLING" | "%future added value";
export type DeployVFolderV2Input = {
  deploymentStrategy?: PresetDeploymentStrategyInput | null | undefined;
  desiredReplicaCount?: number;
  openToPublic?: boolean | null | undefined;
  projectId: string;
  replicaCount?: number | null | undefined;
  resourceGroup: string;
  revisionHistoryLimit?: number | null | undefined;
  revisionPresetId: string;
};
export type PresetDeploymentStrategyInput = {
  blueGreen?: BlueGreenConfigInput | null | undefined;
  rollingUpdate?: RollingUpdateConfigInput | null | undefined;
  type: DeploymentStrategyType;
};
export type RollingUpdateConfigInput = {
  maxSurge?: IntOrPercentInput | null | undefined;
  maxUnavailable?: IntOrPercentInput | null | undefined;
};
export type IntOrPercentInput = {
  count?: number | null | undefined;
  percent?: number | null | undefined;
};
export type BlueGreenConfigInput = {
  autoPromote?: boolean;
  promoteDelaySeconds?: number;
};
export type useDeploymentLauncherDeployVFolderMutation$variables = {
  input: DeployVFolderV2Input;
  vfolderId: string;
};
export type useDeploymentLauncherDeployVFolderMutation$data = {
  readonly deployVfolderV2: {
    readonly deploymentId: string;
  } | null | undefined;
};
export type useDeploymentLauncherDeployVFolderMutation = {
  response: useDeploymentLauncherDeployVFolderMutation$data;
  variables: useDeploymentLauncherDeployVFolderMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "input"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "vfolderId"
},
v2 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      },
      {
        "kind": "Variable",
        "name": "vfolderId",
        "variableName": "vfolderId"
      }
    ],
    "concreteType": "DeployVFolderV2Payload",
    "kind": "LinkedField",
    "name": "deployVfolderV2",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "deploymentId",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "useDeploymentLauncherDeployVFolderMutation",
    "selections": (v2/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "useDeploymentLauncherDeployVFolderMutation",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "bd342a3a0ab3831d59c0650492d02f32",
    "id": null,
    "metadata": {},
    "name": "useDeploymentLauncherDeployVFolderMutation",
    "operationKind": "mutation",
    "text": "mutation useDeploymentLauncherDeployVFolderMutation(\n  $vfolderId: UUID!\n  $input: DeployVFolderV2Input!\n) {\n  deployVfolderV2(vfolderId: $vfolderId, input: $input) {\n    deploymentId\n  }\n}\n"
  }
};
})();

(node as any).hash = "ed76db3f7585bae878878b018f333cf5";

export default node;

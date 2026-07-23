/**
 * @generated SignedSource<<3bf0da131476a8ed26339a8b43147093>>
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
export type VFolderDeployModalMutation$variables = {
  input: DeployVFolderV2Input;
  vfolderId: string;
};
export type VFolderDeployModalMutation$data = {
  readonly deployVfolderV2: {
    readonly deploymentId: string;
    readonly deploymentName: string;
  } | null | undefined;
};
export type VFolderDeployModalMutation = {
  response: VFolderDeployModalMutation$data;
  variables: VFolderDeployModalMutation$variables;
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
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "deploymentName",
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
    "name": "VFolderDeployModalMutation",
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
    "name": "VFolderDeployModalMutation",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "c671279350afe1d857db9255f4f5f1c2",
    "id": null,
    "metadata": {},
    "name": "VFolderDeployModalMutation",
    "operationKind": "mutation",
    "text": "mutation VFolderDeployModalMutation(\n  $vfolderId: UUID!\n  $input: DeployVFolderV2Input!\n) {\n  deployVfolderV2(vfolderId: $vfolderId, input: $input) {\n    deploymentId\n    deploymentName\n  }\n}\n"
  }
};
})();

(node as any).hash = "c790d2156b718bb3373be55a23a2fa28";

export default node;

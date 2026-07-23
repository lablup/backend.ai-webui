/**
 * @generated SignedSource<<f2bcc1ad0ed133e4cf967f90d514a7c2>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type DeploymentStrategyType = "BLUE_GREEN" | "ROLLING" | "%future added value";
export type DeployModelCardV2Input = {
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
export type ModelCardDeployModalMutation$variables = {
  cardId: string;
  input: DeployModelCardV2Input;
};
export type ModelCardDeployModalMutation$data = {
  readonly deployModelCardV2: {
    readonly deploymentId: string;
    readonly deploymentName: string;
  } | null | undefined;
};
export type ModelCardDeployModalMutation = {
  response: ModelCardDeployModalMutation$data;
  variables: ModelCardDeployModalMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "cardId"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "cardId",
        "variableName": "cardId"
      },
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "DeployModelCardV2Payload",
    "kind": "LinkedField",
    "name": "deployModelCardV2",
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "ModelCardDeployModalMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ModelCardDeployModalMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "5807cfb4af3880080d81abda33a359f1",
    "id": null,
    "metadata": {},
    "name": "ModelCardDeployModalMutation",
    "operationKind": "mutation",
    "text": "mutation ModelCardDeployModalMutation(\n  $cardId: UUID!\n  $input: DeployModelCardV2Input!\n) {\n  deployModelCardV2(cardId: $cardId, input: $input) {\n    deploymentId\n    deploymentName\n  }\n}\n"
  }
};
})();

(node as any).hash = "31b787d375c6dbc2075347e8c4a5c5c0";

export default node;

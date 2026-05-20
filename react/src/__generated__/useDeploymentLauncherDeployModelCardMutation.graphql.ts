/**
 * @generated SignedSource<<c14274c6efee263748ad9a6313fbc857>>
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
export type useDeploymentLauncherDeployModelCardMutation$variables = {
  cardId: string;
  input: DeployModelCardV2Input;
};
export type useDeploymentLauncherDeployModelCardMutation$data = {
  readonly deployModelCardV2: {
    readonly deploymentId: string;
  } | null | undefined;
};
export type useDeploymentLauncherDeployModelCardMutation = {
  response: useDeploymentLauncherDeployModelCardMutation$data;
  variables: useDeploymentLauncherDeployModelCardMutation$variables;
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
    "name": "useDeploymentLauncherDeployModelCardMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "useDeploymentLauncherDeployModelCardMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "4411c2c71c17cb1fab7bd4c9facdbcc9",
    "id": null,
    "metadata": {},
    "name": "useDeploymentLauncherDeployModelCardMutation",
    "operationKind": "mutation",
    "text": "mutation useDeploymentLauncherDeployModelCardMutation(\n  $cardId: UUID!\n  $input: DeployModelCardV2Input!\n) {\n  deployModelCardV2(cardId: $cardId, input: $input) {\n    deploymentId\n  }\n}\n"
  }
};
})();

(node as any).hash = "b81c15d47c990550dffe20a81a563364";

export default node;

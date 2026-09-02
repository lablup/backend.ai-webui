/**
 * @generated SignedSource<<561efcd307b8ee76d0e2faad28eaa910>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type DeploymentStrategyType = "BLUE_GREEN" | "ROLLING" | "%future added value";
export type UpdateDeploymentInput = {
  defaultDeploymentStrategy?: DeploymentStrategyInput | null | undefined;
  id: string;
  name?: string | null | undefined;
  openToPublic?: boolean | null | undefined;
  preferredDomainName?: string | null | undefined;
  replicaCount?: number | null | undefined;
  tags?: ReadonlyArray<string> | null | undefined;
};
export type DeploymentStrategyInput = {
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
export type DeploymentSettingModalUpdateMutation$variables = {
  input: UpdateDeploymentInput;
};
export type DeploymentSettingModalUpdateMutation$data = {
  readonly updateModelDeployment: {
    readonly deployment: {
      readonly id: string;
      readonly metadata: {
        readonly name: string;
        readonly resourceGroupName: string;
        readonly tags: ReadonlyArray<string>;
        readonly updatedAt: string;
      };
      readonly networkAccess: {
        readonly openToPublic: boolean;
      };
      readonly replicaState: {
        readonly desiredReplicaCount: number;
      };
    };
  } | null | undefined;
};
export type DeploymentSettingModalUpdateMutation = {
  response: DeploymentSettingModalUpdateMutation$data;
  variables: DeploymentSettingModalUpdateMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
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
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "UpdateDeploymentPayload",
    "kind": "LinkedField",
    "name": "updateModelDeployment",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "ModelDeployment",
        "kind": "LinkedField",
        "name": "deployment",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "ModelDeploymentMetadata",
            "kind": "LinkedField",
            "name": "metadata",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "name",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "tags",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "resourceGroupName",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "updatedAt",
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "ModelDeploymentNetworkAccess",
            "kind": "LinkedField",
            "name": "networkAccess",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "openToPublic",
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "ReplicaState",
            "kind": "LinkedField",
            "name": "replicaState",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "desiredReplicaCount",
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
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
    "name": "DeploymentSettingModalUpdateMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "DeploymentSettingModalUpdateMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "ac9e20ce5b931369ce4ca5f78ca57923",
    "id": null,
    "metadata": {},
    "name": "DeploymentSettingModalUpdateMutation",
    "operationKind": "mutation",
    "text": "mutation DeploymentSettingModalUpdateMutation(\n  $input: UpdateDeploymentInput!\n) {\n  updateModelDeployment(input: $input) {\n    deployment {\n      id\n      metadata {\n        name\n        tags\n        resourceGroupName\n        updatedAt\n      }\n      networkAccess {\n        openToPublic\n      }\n      replicaState {\n        desiredReplicaCount\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "bdc119d19a1ff9cb9611a02edc900367";

export default node;

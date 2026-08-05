/**
 * @generated SignedSource<<494c648f688acacfe4488ea61378aeb3>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
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
        readonly updatedAt: string;
        readonly " $fragmentSpreads": FragmentRefs<"BAIDeploymentTagChips_metadata">;
      };
      readonly " $fragmentSpreads": FragmentRefs<"DeploymentSettingModal_deployment">;
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
    "kind": "Variable",
    "name": "input",
    "variableName": "input"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "updatedAt",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "DeploymentSettingModalUpdateMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
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
              (v2/*: any*/),
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "DeploymentSettingModal_deployment"
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "ModelDeploymentMetadata",
                "kind": "LinkedField",
                "name": "metadata",
                "plural": false,
                "selections": [
                  (v3/*: any*/),
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "BAIDeploymentTagChips_metadata"
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
    ],
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "DeploymentSettingModalUpdateMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
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
              (v2/*: any*/),
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
                  (v3/*: any*/)
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
    ]
  },
  "params": {
    "cacheID": "ca6b1623612613e9ed2c5e6e2e29de8d",
    "id": null,
    "metadata": {},
    "name": "DeploymentSettingModalUpdateMutation",
    "operationKind": "mutation",
    "text": "mutation DeploymentSettingModalUpdateMutation(\n  $input: UpdateDeploymentInput!\n) {\n  updateModelDeployment(input: $input) {\n    deployment {\n      id\n      ...DeploymentSettingModal_deployment\n      metadata {\n        updatedAt\n        ...BAIDeploymentTagChips_metadata\n      }\n    }\n  }\n}\n\nfragment BAIDeploymentTagChips_metadata on ModelDeploymentMetadata {\n  tags\n}\n\nfragment DeploymentSettingModal_deployment on ModelDeployment {\n  id\n  metadata {\n    name\n    tags\n    resourceGroupName\n  }\n  networkAccess {\n    openToPublic\n  }\n  replicaState {\n    desiredReplicaCount\n  }\n}\n"
  }
};
})();

(node as any).hash = "b56acd7214b6bdd12a2f90b233c3d2bc";

export default node;

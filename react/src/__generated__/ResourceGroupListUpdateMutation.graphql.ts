/**
 * @generated SignedSource<<5a464c093aa0340daad7991afe2fedf7>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type PreemptionMode = "RESCHEDULE" | "TERMINATE" | "%future added value";
export type PreemptionOrder = "FEWEST_SESSIONS" | "NEWEST" | "OLDEST" | "SMALLEST_RESOURCES" | "%future added value";
export type PreemptionVictimScope = "DOMAIN" | "PROJECT" | "RESOURCE_GROUP" | "USER" | "%future added value";
export type SchedulerType = "DRF" | "FAIR_SHARE" | "FIFO" | "LIFO" | "%future added value";
export type UpdateResourceGroupV2Input = {
  appProxyAddr?: string | null | undefined;
  appproxyApiToken?: string | null | undefined;
  description?: string | null | undefined;
  isActive?: boolean | null | undefined;
  isDefault?: boolean | null | undefined;
  isPublic?: boolean | null | undefined;
  preemption?: PreemptionConfigInput | null | undefined;
  schedulerType?: SchedulerType | null | undefined;
  useHostNetwork?: boolean | null | undefined;
};
export type PreemptionConfigInput = {
  enabled?: boolean;
  mode?: PreemptionMode;
  order?: PreemptionOrder;
  preemptiblePriority?: number;
  preemptionMinRuntime?: number;
  victimScope?: PreemptionVictimScope;
};
export type ResourceGroupListUpdateMutation$variables = {
  id: string;
  input: UpdateResourceGroupV2Input;
};
export type ResourceGroupListUpdateMutation$data = {
  readonly updateResourceGroup: {
    readonly resourceGroup: {
      readonly id: string;
      readonly status: {
        readonly isActive: boolean;
      };
    };
  };
};
export type ResourceGroupListUpdateMutation = {
  response: ResourceGroupListUpdateMutation$data;
  variables: ResourceGroupListUpdateMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
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
        "name": "id",
        "variableName": "id"
      },
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "UpdateResourceGroupPayload",
    "kind": "LinkedField",
    "name": "updateResourceGroup",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "ResourceGroup",
        "kind": "LinkedField",
        "name": "resourceGroup",
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
            "concreteType": "ResourceGroupStatus",
            "kind": "LinkedField",
            "name": "status",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "isActive",
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
    "name": "ResourceGroupListUpdateMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ResourceGroupListUpdateMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "f64fa5534c6de72ab1d45a7ed05dc397",
    "id": null,
    "metadata": {},
    "name": "ResourceGroupListUpdateMutation",
    "operationKind": "mutation",
    "text": "mutation ResourceGroupListUpdateMutation(\n  $id: UUID!\n  $input: UpdateResourceGroupV2Input!\n) {\n  updateResourceGroup(id: $id, input: $input) {\n    resourceGroup {\n      id\n      status {\n        isActive\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "a5b040e9ad598533c5be246dee30a9b8";

export default node;

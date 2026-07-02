/**
 * @generated SignedSource<<07bef5e55ad6186f50be9179ab8d3087>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type PreemptionMode = "RESCHEDULE" | "TERMINATE" | "%future added value";
export type PreemptionOrder = "NEWEST" | "OLDEST" | "%future added value";
export type SchedulerType = "DRF" | "FAIR_SHARE" | "FIFO" | "LIFO" | "%future added value";
export type UpdateResourceGroupInput = {
  appProxyAddr?: string | null | undefined;
  appproxyApiToken?: string | null | undefined;
  description?: string | null | undefined;
  isActive?: boolean | null | undefined;
  isPublic?: boolean | null | undefined;
  preemption?: PreemptionConfigInput | null | undefined;
  resourceGroupName: string;
  schedulerType?: SchedulerType | null | undefined;
  useHostNetwork?: boolean | null | undefined;
};
export type PreemptionConfigInput = {
  mode?: PreemptionMode;
  order?: PreemptionOrder;
  preemptiblePriority?: number;
};
export type ResourceGroupSettingModalUpdateMutation$variables = {
  input: UpdateResourceGroupInput;
};
export type ResourceGroupSettingModalUpdateMutation$data = {
  readonly adminUpdateResourceGroup: {
    readonly resourceGroup: {
      readonly id: string;
      readonly metadata: {
        readonly description: string | null | undefined;
      };
      readonly name: string;
      readonly network: {
        readonly useHostNetwork: boolean;
        readonly wsproxyAddr: string | null | undefined;
      };
      readonly scheduler: {
        readonly preemption: {
          readonly mode: PreemptionMode;
          readonly order: PreemptionOrder;
          readonly preemptiblePriority: number;
        };
        readonly type: SchedulerType;
      };
      readonly status: {
        readonly isActive: boolean;
        readonly isPublic: boolean;
      };
    };
  } | null | undefined;
};
export type ResourceGroupSettingModalUpdateMutation = {
  response: ResourceGroupSettingModalUpdateMutation$data;
  variables: ResourceGroupSettingModalUpdateMutation$variables;
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
    "concreteType": "UpdateResourceGroupPayload",
    "kind": "LinkedField",
    "name": "adminUpdateResourceGroup",
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
            "kind": "ScalarField",
            "name": "name",
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
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "isPublic",
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "ResourceGroupMetadata",
            "kind": "LinkedField",
            "name": "metadata",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "description",
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "ResourceGroupNetworkConfig",
            "kind": "LinkedField",
            "name": "network",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "wsproxyAddr",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "useHostNetwork",
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "ResourceGroupSchedulerConfig",
            "kind": "LinkedField",
            "name": "scheduler",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "type",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "PreemptionConfig",
                "kind": "LinkedField",
                "name": "preemption",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "preemptiblePriority",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "order",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "mode",
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
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "ResourceGroupSettingModalUpdateMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ResourceGroupSettingModalUpdateMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "3c5eefa39e52e0b55040d1fc59bac9cb",
    "id": null,
    "metadata": {},
    "name": "ResourceGroupSettingModalUpdateMutation",
    "operationKind": "mutation",
    "text": "mutation ResourceGroupSettingModalUpdateMutation(\n  $input: UpdateResourceGroupInput!\n) {\n  adminUpdateResourceGroup(input: $input) {\n    resourceGroup {\n      id\n      name\n      status {\n        isActive\n        isPublic\n      }\n      metadata {\n        description\n      }\n      network {\n        wsproxyAddr\n        useHostNetwork\n      }\n      scheduler {\n        type\n        preemption {\n          preemptiblePriority\n          order\n          mode\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "92f8f3a06fae49a526a2ad73f15ca551";

export default node;

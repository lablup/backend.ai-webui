/**
 * @generated SignedSource<<f0bdeadc1976c76006b384777aa4fdf7>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type PreemptionMode = "RESCHEDULE" | "TERMINATE" | "%future added value";
export type PreemptionOrder = "NEWEST" | "OLDEST" | "%future added value";
export type ResourceGroupSettingModalPrefillQuery$variables = {
  name: string;
};
export type ResourceGroupSettingModalPrefillQuery$data = {
  readonly resourceGroup: {
    readonly name: string;
    readonly network: {
      readonly useHostNetwork: boolean;
    };
    readonly scheduler: {
      readonly preemption: {
        readonly mode: PreemptionMode;
        readonly order: PreemptionOrder;
        readonly preemptiblePriority: number;
      };
    };
  } | null | undefined;
};
export type ResourceGroupSettingModalPrefillQuery = {
  response: ResourceGroupSettingModalPrefillQuery$data;
  variables: ResourceGroupSettingModalPrefillQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "name"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "name",
    "variableName": "name"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v3 = {
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
      "name": "useHostNetwork",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v4 = {
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
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "ResourceGroupSettingModalPrefillQuery",
    "selections": [
      {
        "alias": "resourceGroup",
        "args": (v1/*: any*/),
        "concreteType": "ResourceGroup",
        "kind": "LinkedField",
        "name": "adminResourceGroupV2",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/),
          (v4/*: any*/)
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ResourceGroupSettingModalPrefillQuery",
    "selections": [
      {
        "alias": "resourceGroup",
        "args": (v1/*: any*/),
        "concreteType": "ResourceGroup",
        "kind": "LinkedField",
        "name": "adminResourceGroupV2",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/),
          (v4/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "6903dc82a17bdb4558d3b94fc54223e7",
    "id": null,
    "metadata": {},
    "name": "ResourceGroupSettingModalPrefillQuery",
    "operationKind": "query",
    "text": "query ResourceGroupSettingModalPrefillQuery(\n  $name: String!\n) {\n  resourceGroup: adminResourceGroupV2(name: $name) {\n    name\n    network {\n      useHostNetwork\n    }\n    scheduler {\n      preemption {\n        preemptiblePriority\n        order\n        mode\n      }\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "070f50906c9db3d19217beafc468d9eb";

export default node;

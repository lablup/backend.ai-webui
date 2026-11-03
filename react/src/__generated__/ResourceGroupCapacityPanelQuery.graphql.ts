/**
 * @generated SignedSource<<df587d9735503e440834274f428a2b83>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { Result } from "relay-runtime";
export type ResourceGroupCapacityPanelQuery$variables = {
  resourceGroupName: string;
};
export type ResourceGroupCapacityPanelQuery$data = {
  readonly resourceGroupResourceAllocationV2: Result<{
    readonly resourceGroup: {
      readonly capacity: ReadonlyArray<{
        readonly quantity: any;
        readonly resourceType: string;
      }>;
      readonly used: ReadonlyArray<{
        readonly quantity: any;
        readonly resourceType: string;
      }>;
    };
  } | null | undefined, unknown>;
};
export type ResourceGroupCapacityPanelQuery = {
  response: ResourceGroupCapacityPanelQuery$data;
  variables: ResourceGroupCapacityPanelQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "resourceGroupName"
  }
],
v1 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "resourceType",
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "quantity",
    "storageKey": null
  }
],
v2 = {
  "alias": null,
  "args": [
    {
      "kind": "Variable",
      "name": "resourceGroupName",
      "variableName": "resourceGroupName"
    }
  ],
  "concreteType": "ResourceGroupResourceAllocationV2",
  "kind": "LinkedField",
  "name": "resourceGroupResourceAllocationV2",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "ResourceGroupUsageV2",
      "kind": "LinkedField",
      "name": "resourceGroup",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "ResourceSlotEntry",
          "kind": "LinkedField",
          "name": "capacity",
          "plural": true,
          "selections": (v1/*: any*/),
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "concreteType": "ResourceSlotEntry",
          "kind": "LinkedField",
          "name": "used",
          "plural": true,
          "selections": (v1/*: any*/),
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
    "name": "ResourceGroupCapacityPanelQuery",
    "selections": [
      {
        "kind": "CatchField",
        "field": (v2/*: any*/),
        "to": "RESULT"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ResourceGroupCapacityPanelQuery",
    "selections": [
      (v2/*: any*/)
    ]
  },
  "params": {
    "cacheID": "e921a8bf72f7ef1784075dd749081708",
    "id": null,
    "metadata": {},
    "name": "ResourceGroupCapacityPanelQuery",
    "operationKind": "query",
    "text": "query ResourceGroupCapacityPanelQuery(\n  $resourceGroupName: String!\n) {\n  resourceGroupResourceAllocationV2(resourceGroupName: $resourceGroupName) {\n    resourceGroup {\n      capacity {\n        resourceType\n        quantity\n      }\n      used {\n        resourceType\n        quantity\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "5590ee2aa10086a9da6aafbd0954d6c1";

export default node;

/**
 * @generated SignedSource<<630916cbf2e49473967582e89b541682>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ResourceGroupCapacityPanelQuery$variables = {
  resourceGroupName: string;
};
export type ResourceGroupCapacityPanelQuery$data = {
  readonly resourceGroupResourceAllocationV2: {
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
  } | null | undefined;
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
v2 = [
  {
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
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "ResourceGroupCapacityPanelQuery",
    "selections": (v2/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ResourceGroupCapacityPanelQuery",
    "selections": (v2/*: any*/)
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

(node as any).hash = "d8c3b476aa026abcecb53d7981824726";

export default node;

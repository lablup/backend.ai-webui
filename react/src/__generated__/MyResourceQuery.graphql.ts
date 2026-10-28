/**
 * @generated SignedSource<<7264f3cb29e3a7789a9b204d35c91352>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type EffectiveResourceAllocationV2Input = {
  projectId: string;
  resourceGroupName: string;
};
export type MyResourceQuery$variables = {
  input: EffectiveResourceAllocationV2Input;
};
export type MyResourceQuery$data = {
  readonly " $fragmentSpreads": FragmentRefs<"MyResourceV2StatisticsFragment">;
};
export type MyResourceQuery = {
  response: MyResourceQuery$data;
  variables: MyResourceQuery$variables;
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
  "name": "resourceType",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "quantity",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "concreteType": "ResourceLimitEntry",
  "kind": "LinkedField",
  "name": "assignable",
  "plural": true,
  "selections": [
    (v2/*: any*/),
    (v3/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "unlimited",
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
    "name": "MyResourceQuery",
    "selections": [
      {
        "args": (v1/*: any*/),
        "kind": "FragmentSpread",
        "name": "MyResourceV2StatisticsFragment"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "MyResourceQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "EffectiveResourceAllocationV2",
        "kind": "LinkedField",
        "name": "effectiveResourceAllocationV2",
        "plural": false,
        "selections": [
          (v4/*: any*/)
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "UserResourceAllocationV2",
        "kind": "LinkedField",
        "name": "myUserResourceAllocationV2",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "ScopeResourceUsageV2",
            "kind": "LinkedField",
            "name": "user",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "ResourceSlotEntry",
                "kind": "LinkedField",
                "name": "used",
                "plural": true,
                "selections": [
                  (v2/*: any*/),
                  (v3/*: any*/)
                ],
                "storageKey": null
              },
              (v4/*: any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "42dee6f52f1909413440916b6600adf1",
    "id": null,
    "metadata": {},
    "name": "MyResourceQuery",
    "operationKind": "query",
    "text": "query MyResourceQuery(\n  $input: EffectiveResourceAllocationV2Input!\n) {\n  ...MyResourceV2StatisticsFragment_2VV6jB\n}\n\nfragment MyResourceV2StatisticsFragment_2VV6jB on Query {\n  effectiveResourceAllocationV2(input: $input) {\n    assignable {\n      resourceType\n      quantity\n      unlimited\n    }\n  }\n  myUserResourceAllocationV2 {\n    user {\n      used {\n        resourceType\n        quantity\n      }\n      assignable {\n        resourceType\n        quantity\n        unlimited\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "1a75d7528181a61d1c934c148e1dff50";

export default node;

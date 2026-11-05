/**
 * @generated SignedSource<<4eefbbf63bde5eaf93295bd915b4417d>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type MyResourceQuery$variables = {
  projectId: string;
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
    "name": "projectId"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "projectId",
    "variableName": "projectId"
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
      },
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "ProjectResourceAllocationV2",
        "kind": "LinkedField",
        "name": "projectResourceAllocationV2",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "ScopeResourceUsageV2",
            "kind": "LinkedField",
            "name": "project",
            "plural": false,
            "selections": [
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
    "cacheID": "5aff3176d70fc137364b6d926bddf818",
    "id": null,
    "metadata": {},
    "name": "MyResourceQuery",
    "operationKind": "query",
    "text": "query MyResourceQuery(\n  $projectId: UUID!\n) {\n  ...MyResourceV2StatisticsFragment_2CgS8h\n}\n\nfragment MyResourceV2StatisticsFragment_2CgS8h on Query {\n  myUserResourceAllocationV2 {\n    user {\n      used {\n        resourceType\n        quantity\n      }\n      assignable {\n        resourceType\n        quantity\n        unlimited\n      }\n    }\n  }\n  projectResourceAllocationV2(projectId: $projectId) {\n    project {\n      assignable {\n        resourceType\n        quantity\n        unlimited\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "988fab69ff21fd559ff9dc74ceed242d";

export default node;

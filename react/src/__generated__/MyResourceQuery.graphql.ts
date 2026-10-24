/**
 * @generated SignedSource<<ff0b025b6212a0904c802a1b8c3d4744>>
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
v4 = [
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
v5 = {
  "alias": null,
  "args": null,
  "concreteType": "ResourceLimitEntry",
  "kind": "LinkedField",
  "name": "limits",
  "plural": true,
  "selections": (v4/*: any*/),
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "concreteType": "ResourceLimitEntry",
  "kind": "LinkedField",
  "name": "assignable",
  "plural": true,
  "selections": (v4/*: any*/),
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
        "concreteType": "KeypairResourceAllocationV2",
        "kind": "LinkedField",
        "name": "myKeypairResourceAllocationV2",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "ScopeResourceUsageV2",
            "kind": "LinkedField",
            "name": "keypair",
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
              (v5/*: any*/),
              (v6/*: any*/)
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
              (v5/*: any*/),
              (v6/*: any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "1563dab142a9e53bfd7ec9ae7703cf51",
    "id": null,
    "metadata": {},
    "name": "MyResourceQuery",
    "operationKind": "query",
    "text": "query MyResourceQuery(\n  $projectId: UUID!\n) {\n  ...MyResourceV2StatisticsFragment_2CgS8h\n}\n\nfragment MyResourceV2StatisticsFragment_2CgS8h on Query {\n  myKeypairResourceAllocationV2 {\n    keypair {\n      used {\n        resourceType\n        quantity\n      }\n      limits {\n        resourceType\n        quantity\n        unlimited\n      }\n      assignable {\n        resourceType\n        quantity\n        unlimited\n      }\n    }\n  }\n  projectResourceAllocationV2(projectId: $projectId) {\n    project {\n      limits {\n        resourceType\n        quantity\n        unlimited\n      }\n      assignable {\n        resourceType\n        quantity\n        unlimited\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "988fab69ff21fd559ff9dc74ceed242d";

export default node;

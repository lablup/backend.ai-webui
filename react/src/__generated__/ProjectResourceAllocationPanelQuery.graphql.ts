/**
 * @generated SignedSource<<5d5d1277f18bb93d0a5558c2d5635a92>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ProjectResourceAllocationPanelQuery$variables = {
  projectId: string;
};
export type ProjectResourceAllocationPanelQuery$data = {
  readonly projectResourceAllocationV2: {
    readonly project: {
      readonly limits: ReadonlyArray<{
        readonly quantity: any | null | undefined;
        readonly resourceType: string;
        readonly unlimited: boolean;
      }>;
      readonly used: ReadonlyArray<{
        readonly quantity: any;
        readonly resourceType: string;
      }>;
    };
  } | null | undefined;
};
export type ProjectResourceAllocationPanelQuery = {
  response: ProjectResourceAllocationPanelQuery$data;
  variables: ProjectResourceAllocationPanelQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "projectId"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "resourceType",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "quantity",
  "storageKey": null
},
v3 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "projectId",
        "variableName": "projectId"
      }
    ],
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
          {
            "alias": null,
            "args": null,
            "concreteType": "ResourceLimitEntry",
            "kind": "LinkedField",
            "name": "limits",
            "plural": true,
            "selections": [
              (v1/*: any*/),
              (v2/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "unlimited",
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "ResourceSlotEntry",
            "kind": "LinkedField",
            "name": "used",
            "plural": true,
            "selections": [
              (v1/*: any*/),
              (v2/*: any*/)
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
    "name": "ProjectResourceAllocationPanelQuery",
    "selections": (v3/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ProjectResourceAllocationPanelQuery",
    "selections": (v3/*: any*/)
  },
  "params": {
    "cacheID": "368a14784dfca3b82262d7fe9192b3c0",
    "id": null,
    "metadata": {},
    "name": "ProjectResourceAllocationPanelQuery",
    "operationKind": "query",
    "text": "query ProjectResourceAllocationPanelQuery(\n  $projectId: UUID!\n) {\n  projectResourceAllocationV2(projectId: $projectId) {\n    project {\n      limits {\n        resourceType\n        quantity\n        unlimited\n      }\n      used {\n        resourceType\n        quantity\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "bb3f4cbffdccecfb1f21a7ddb96b44cc";

export default node;

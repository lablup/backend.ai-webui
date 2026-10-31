/**
 * @generated SignedSource<<952601b91fdef3a1e96b31604e488a06>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ResourceAllocationPanelProjectQuery$variables = {
  projectId: string;
};
export type ResourceAllocationPanelProjectQuery$data = {
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
export type ResourceAllocationPanelProjectQuery = {
  response: ResourceAllocationPanelProjectQuery$data;
  variables: ResourceAllocationPanelProjectQuery$variables;
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
    "name": "ResourceAllocationPanelProjectQuery",
    "selections": (v3/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ResourceAllocationPanelProjectQuery",
    "selections": (v3/*: any*/)
  },
  "params": {
    "cacheID": "facc465bb7c0ae78641b7d22c94947c0",
    "id": null,
    "metadata": {},
    "name": "ResourceAllocationPanelProjectQuery",
    "operationKind": "query",
    "text": "query ResourceAllocationPanelProjectQuery(\n  $projectId: UUID!\n) {\n  projectResourceAllocationV2(projectId: $projectId) {\n    project {\n      limits {\n        resourceType\n        quantity\n        unlimited\n      }\n      used {\n        resourceType\n        quantity\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "527faebb1d1df4c93508a9f0b3e1d16e";

export default node;

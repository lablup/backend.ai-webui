/**
 * @generated SignedSource<<0f31caf74d2ecefa34528efac850d763>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { Result } from "relay-runtime";
export type ProjectAllocationsPanelAllocationQuery$variables = {
  projectId: string;
};
export type ProjectAllocationsPanelAllocationQuery$data = {
  readonly projectResourceAllocationV2: Result<{
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
  } | null | undefined, unknown>;
};
export type ProjectAllocationsPanelAllocationQuery = {
  response: ProjectAllocationsPanelAllocationQuery$data;
  variables: ProjectAllocationsPanelAllocationQuery$variables;
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
v3 = {
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
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "ProjectAllocationsPanelAllocationQuery",
    "selections": [
      {
        "kind": "CatchField",
        "field": (v3/*: any*/),
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
    "name": "ProjectAllocationsPanelAllocationQuery",
    "selections": [
      (v3/*: any*/)
    ]
  },
  "params": {
    "cacheID": "47ff2bc3bba480727e2cb0792a4162be",
    "id": null,
    "metadata": {},
    "name": "ProjectAllocationsPanelAllocationQuery",
    "operationKind": "query",
    "text": "query ProjectAllocationsPanelAllocationQuery(\n  $projectId: UUID!\n) {\n  projectResourceAllocationV2(projectId: $projectId) {\n    project {\n      limits {\n        resourceType\n        quantity\n        unlimited\n      }\n      used {\n        resourceType\n        quantity\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "adcc4780cc352d0f74e546f514517a98";

export default node;

/**
 * @generated SignedSource<<ce4206aa2057ac387c8aa7a1a4af488b>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type StorageStatusPanelCardQuery$variables = {
  projectId: string;
};
export type StorageStatusPanelCardQuery$data = {
  readonly group: {
    readonly resource_policy: string | null | undefined;
  } | null | undefined;
  readonly user_resource_policy: {
    readonly max_vfolder_count: number | null | undefined;
  } | null | undefined;
};
export type StorageStatusPanelCardQuery = {
  response: StorageStatusPanelCardQuery$data;
  variables: StorageStatusPanelCardQuery$variables;
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
  "name": "max_vfolder_count",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": [
    {
      "kind": "Variable",
      "name": "id",
      "variableName": "projectId"
    },
    {
      "kind": "Literal",
      "name": "type",
      "value": [
        "GENERAL",
        "MODEL_STORE"
      ]
    }
  ],
  "concreteType": "Group",
  "kind": "LinkedField",
  "name": "group",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "resource_policy",
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
    "name": "StorageStatusPanelCardQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "UserResourcePolicy",
        "kind": "LinkedField",
        "name": "user_resource_policy",
        "plural": false,
        "selections": [
          (v1/*: any*/)
        ],
        "storageKey": null
      },
      (v2/*: any*/)
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "StorageStatusPanelCardQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "UserResourcePolicy",
        "kind": "LinkedField",
        "name": "user_resource_policy",
        "plural": false,
        "selections": [
          (v1/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      (v2/*: any*/)
    ]
  },
  "params": {
    "cacheID": "44c9f83b1286f073c54d1214d4764209",
    "id": null,
    "metadata": {},
    "name": "StorageStatusPanelCardQuery",
    "operationKind": "query",
    "text": "query StorageStatusPanelCardQuery(\n  $projectId: UUID!\n) {\n  user_resource_policy {\n    max_vfolder_count\n    id\n  }\n  group(id: $projectId, type: [\"GENERAL\", \"MODEL_STORE\"]) {\n    resource_policy\n  }\n}\n"
  }
};
})();

(node as any).hash = "711f6156aa407141b35d3f7a3ddc8e5f";

export default node;

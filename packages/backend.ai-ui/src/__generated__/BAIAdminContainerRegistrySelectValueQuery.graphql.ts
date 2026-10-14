/**
 * @generated SignedSource<<89597bd7885f0a1829469ac4b0f68bfa>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BAIAdminContainerRegistrySelectValueQuery$variables = {
  nodeId: string;
  skipSelected: boolean;
};
export type BAIAdminContainerRegistrySelectValueQuery$data = {
  readonly node?: {
    readonly entityId?: string;
    readonly id?: string;
    readonly project?: string | null | undefined;
    readonly registryName?: string;
  } | null | undefined;
};
export type BAIAdminContainerRegistrySelectValueQuery = {
  response: BAIAdminContainerRegistrySelectValueQuery$data;
  variables: BAIAdminContainerRegistrySelectValueQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "nodeId"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "skipSelected"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "nodeId"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "entityId",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "registryName",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "project",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "BAIAdminContainerRegistrySelectValueQuery",
    "selections": [
      {
        "condition": "skipSelected",
        "kind": "Condition",
        "passingValue": false,
        "selections": [
          {
            "alias": null,
            "args": (v1/*: any*/),
            "concreteType": null,
            "kind": "LinkedField",
            "name": "node",
            "plural": false,
            "selections": [
              {
                "kind": "InlineFragment",
                "selections": [
                  (v2/*: any*/),
                  (v3/*: any*/),
                  (v4/*: any*/),
                  (v5/*: any*/)
                ],
                "type": "ContainerRegistryV2",
                "abstractKey": null
              }
            ],
            "storageKey": null
          }
        ]
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "BAIAdminContainerRegistrySelectValueQuery",
    "selections": [
      {
        "condition": "skipSelected",
        "kind": "Condition",
        "passingValue": false,
        "selections": [
          {
            "alias": null,
            "args": (v1/*: any*/),
            "concreteType": null,
            "kind": "LinkedField",
            "name": "node",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "__typename",
                "storageKey": null
              },
              (v2/*: any*/),
              {
                "kind": "InlineFragment",
                "selections": [
                  (v3/*: any*/),
                  (v4/*: any*/),
                  (v5/*: any*/)
                ],
                "type": "ContainerRegistryV2",
                "abstractKey": null
              }
            ],
            "storageKey": null
          }
        ]
      }
    ]
  },
  "params": {
    "cacheID": "847a5351fe4bfab1761c60c12b8ca3dc",
    "id": null,
    "metadata": {},
    "name": "BAIAdminContainerRegistrySelectValueQuery",
    "operationKind": "query",
    "text": "query BAIAdminContainerRegistrySelectValueQuery(\n  $nodeId: ID!\n  $skipSelected: Boolean!\n) {\n  node(id: $nodeId) @skip(if: $skipSelected) {\n    __typename\n    ... on ContainerRegistryV2 {\n      id\n      entityId\n      registryName\n      project\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "3480370346a28204f1b8290ddfecd819";

export default node;

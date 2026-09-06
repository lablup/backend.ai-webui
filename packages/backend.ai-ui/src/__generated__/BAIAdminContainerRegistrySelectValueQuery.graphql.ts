/**
 * @generated SignedSource<<c0aa4093c97539496360035e9cd8ce05>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BAIAdminContainerRegistrySelectValueQuery$variables = {
  first: number;
  selectedFilter?: string | null | undefined;
  skipSelected: boolean;
};
export type BAIAdminContainerRegistrySelectValueQuery$data = {
  readonly container_registry_nodes?: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly project: string | null | undefined;
        readonly registry_name: string;
        readonly row_id: string | null | undefined;
      } | null | undefined;
    } | null | undefined>;
  } | null | undefined;
};
export type BAIAdminContainerRegistrySelectValueQuery = {
  response: BAIAdminContainerRegistrySelectValueQuery$data;
  variables: BAIAdminContainerRegistrySelectValueQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "first"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "selectedFilter"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "skipSelected"
},
v3 = [
  {
    "condition": "skipSelected",
    "kind": "Condition",
    "passingValue": false,
    "selections": [
      {
        "alias": null,
        "args": [
          {
            "kind": "Variable",
            "name": "filter",
            "variableName": "selectedFilter"
          },
          {
            "kind": "Variable",
            "name": "first",
            "variableName": "first"
          }
        ],
        "concreteType": "ContainerRegistryConnection",
        "kind": "LinkedField",
        "name": "container_registry_nodes",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "ContainerRegistryEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "ContainerRegistryNode",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "id",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "row_id",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "registry_name",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "project",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "BAIAdminContainerRegistrySelectValueQuery",
    "selections": (v3/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Operation",
    "name": "BAIAdminContainerRegistrySelectValueQuery",
    "selections": (v3/*: any*/)
  },
  "params": {
    "cacheID": "6ea5ee3f947114d6ed6bc4247afe8a1a",
    "id": null,
    "metadata": {},
    "name": "BAIAdminContainerRegistrySelectValueQuery",
    "operationKind": "query",
    "text": "query BAIAdminContainerRegistrySelectValueQuery(\n  $selectedFilter: String\n  $first: Int!\n  $skipSelected: Boolean!\n) {\n  container_registry_nodes(filter: $selectedFilter, first: $first) @skip(if: $skipSelected) {\n    edges {\n      node {\n        id\n        row_id\n        registry_name\n        project\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "dc02ff7c779b6825f7910789b84cbcc8";

export default node;

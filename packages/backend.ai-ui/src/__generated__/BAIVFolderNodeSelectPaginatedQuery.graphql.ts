/**
 * @generated SignedSource<<fe5c6bdf7da740dbeaf34265e8b74f52>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BAIVFolderNodeSelectPaginatedQuery$variables = {
  filter?: string | null | undefined;
  limit: number;
  offset: number;
  permission?: any | null | undefined;
  scopeId?: any | null | undefined;
};
export type BAIVFolderNodeSelectPaginatedQuery$data = {
  readonly vfolder_nodes: {
    readonly count: number | null | undefined;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly name: string | null | undefined;
        readonly row_id: string | null | undefined;
      } | null | undefined;
    } | null | undefined>;
  } | null | undefined;
};
export type BAIVFolderNodeSelectPaginatedQuery = {
  response: BAIVFolderNodeSelectPaginatedQuery$data;
  variables: BAIVFolderNodeSelectPaginatedQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "filter"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "limit"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "offset"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "permission"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "scopeId"
},
v5 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "filter",
        "variableName": "filter"
      },
      {
        "kind": "Variable",
        "name": "first",
        "variableName": "limit"
      },
      {
        "kind": "Variable",
        "name": "offset",
        "variableName": "offset"
      },
      {
        "kind": "Literal",
        "name": "order",
        "value": "-created_at"
      },
      {
        "kind": "Variable",
        "name": "permission",
        "variableName": "permission"
      },
      {
        "kind": "Variable",
        "name": "scope_id",
        "variableName": "scopeId"
      }
    ],
    "concreteType": "VirtualFolderConnection",
    "kind": "LinkedField",
    "name": "vfolder_nodes",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "count",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "VirtualFolderEdge",
        "kind": "LinkedField",
        "name": "edges",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "VirtualFolderNode",
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
                "name": "name",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "row_id",
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
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/),
      (v4/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "BAIVFolderNodeSelectPaginatedQuery",
    "selections": (v5/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v2/*: any*/),
      (v1/*: any*/),
      (v4/*: any*/),
      (v0/*: any*/),
      (v3/*: any*/)
    ],
    "kind": "Operation",
    "name": "BAIVFolderNodeSelectPaginatedQuery",
    "selections": (v5/*: any*/)
  },
  "params": {
    "cacheID": "5ad32d97181a70a8da40ee805316a5fb",
    "id": null,
    "metadata": {},
    "name": "BAIVFolderNodeSelectPaginatedQuery",
    "operationKind": "query",
    "text": "query BAIVFolderNodeSelectPaginatedQuery(\n  $offset: Int!\n  $limit: Int!\n  $scopeId: ScopeField\n  $filter: String\n  $permission: VFolderPermissionValueField\n) {\n  vfolder_nodes(scope_id: $scopeId, offset: $offset, first: $limit, filter: $filter, permission: $permission, order: \"-created_at\") {\n    count\n    edges {\n      node {\n        id\n        name\n        row_id\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "f26888cd7297f9b9c638a2da9ee3b472";

export default node;

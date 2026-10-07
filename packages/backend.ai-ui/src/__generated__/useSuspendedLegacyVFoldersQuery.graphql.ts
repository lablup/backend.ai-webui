/**
 * @generated SignedSource<<9bca70e047967f679b313cfa757b3ad0>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type useSuspendedLegacyVFoldersQuery$variables = {
  filter?: string | null | undefined;
  first?: number | null | undefined;
  scopeId?: any | null | undefined;
};
export type useSuspendedLegacyVFoldersQuery$data = {
  readonly vfolder_nodes: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly created_at: string | null | undefined;
        readonly creator: string | null | undefined;
        readonly group: string | null | undefined;
        readonly group_name: string | null | undefined;
        readonly host: string | null | undefined;
        readonly name: string | null | undefined;
        readonly ownership_type: string | null | undefined;
        readonly permissions: ReadonlyArray<any | null | undefined> | null | undefined;
        readonly row_id: string | null | undefined;
        readonly status: string | null | undefined;
        readonly usage_mode: string | null | undefined;
        readonly user_email: string | null | undefined;
      } | null | undefined;
    } | null | undefined>;
  } | null | undefined;
};
export type useSuspendedLegacyVFoldersQuery = {
  response: useSuspendedLegacyVFoldersQuery$data;
  variables: useSuspendedLegacyVFoldersQuery$variables;
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
  "name": "first"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "scopeId"
},
v3 = [
  {
    "kind": "Variable",
    "name": "filter",
    "variableName": "filter"
  },
  {
    "kind": "Variable",
    "name": "first",
    "variableName": "first"
  },
  {
    "kind": "Literal",
    "name": "offset",
    "value": 0
  },
  {
    "kind": "Variable",
    "name": "scope_id",
    "variableName": "scopeId"
  }
],
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "row_id",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "host",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "status",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "usage_mode",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "created_at",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "user_email",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "group",
  "storageKey": null
},
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "group_name",
  "storageKey": null
},
v13 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "creator",
  "storageKey": null
},
v14 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "ownership_type",
  "storageKey": null
},
v15 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "permissions",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "useSuspendedLegacyVFoldersQuery",
    "selections": [
      {
        "alias": null,
        "args": (v3/*: any*/),
        "concreteType": "VirtualFolderConnection",
        "kind": "LinkedField",
        "name": "vfolder_nodes",
        "plural": false,
        "selections": [
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
                  (v4/*: any*/),
                  (v5/*: any*/),
                  (v6/*: any*/),
                  (v7/*: any*/),
                  (v8/*: any*/),
                  (v9/*: any*/),
                  (v10/*: any*/),
                  (v11/*: any*/),
                  (v12/*: any*/),
                  (v13/*: any*/),
                  (v14/*: any*/),
                  (v15/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v2/*: any*/),
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Operation",
    "name": "useSuspendedLegacyVFoldersQuery",
    "selections": [
      {
        "alias": null,
        "args": (v3/*: any*/),
        "concreteType": "VirtualFolderConnection",
        "kind": "LinkedField",
        "name": "vfolder_nodes",
        "plural": false,
        "selections": [
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
                  (v4/*: any*/),
                  (v5/*: any*/),
                  (v6/*: any*/),
                  (v7/*: any*/),
                  (v8/*: any*/),
                  (v9/*: any*/),
                  (v10/*: any*/),
                  (v11/*: any*/),
                  (v12/*: any*/),
                  (v13/*: any*/),
                  (v14/*: any*/),
                  (v15/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "id",
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
  },
  "params": {
    "cacheID": "67910251e7b49bdc39211c3882c70132",
    "id": null,
    "metadata": {},
    "name": "useSuspendedLegacyVFoldersQuery",
    "operationKind": "query",
    "text": "query useSuspendedLegacyVFoldersQuery(\n  $scopeId: ScopeField\n  $filter: String\n  $first: Int\n) {\n  vfolder_nodes(scope_id: $scopeId, filter: $filter, first: $first, offset: 0) {\n    edges {\n      node {\n        row_id\n        name\n        host\n        status\n        usage_mode\n        created_at\n        user_email\n        group\n        group_name\n        creator\n        ownership_type\n        permissions @since(version: \"26.9.0a1\")\n        id\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "c8760a04e86764e2a0afa7afbc0dafb1";

export default node;

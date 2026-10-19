/**
 * @generated SignedSource<<a225ca267663813e91b8cd5a610d7259>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type PermissionBit = "CREATE" | "HARD_DELETE" | "READ" | "SOFT_DELETE" | "UPDATE" | "%future added value";
export type useVFolderInvitationsSharesQuery$variables = Record<PropertyKey, never>;
export type useVFolderInvitationsSharesQuery$data = {
  readonly myEntityShares: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly entityId: string;
        readonly permissions: ReadonlyArray<PermissionBit>;
      };
    }>;
  } | null | undefined;
};
export type useVFolderInvitationsSharesQuery = {
  response: useVFolderInvitationsSharesQuery$data;
  variables: useVFolderInvitationsSharesQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "limit",
    "value": 100
  },
  {
    "kind": "Literal",
    "name": "sides",
    "value": [
      "RECIPIENT"
    ]
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "entityId",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "permissions",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "useVFolderInvitationsSharesQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": "EntityShareConnection",
        "kind": "LinkedField",
        "name": "myEntityShares",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "EntityShareEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "EntityShare",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
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
        "storageKey": "myEntityShares(limit:100,sides:[\"RECIPIENT\"])"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "useVFolderInvitationsSharesQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": "EntityShareConnection",
        "kind": "LinkedField",
        "name": "myEntityShares",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "EntityShareEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "EntityShare",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v1/*: any*/),
                  (v2/*: any*/),
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
        "storageKey": "myEntityShares(limit:100,sides:[\"RECIPIENT\"])"
      }
    ]
  },
  "params": {
    "cacheID": "87cec5283174b7066cbced41e827c83e",
    "id": null,
    "metadata": {},
    "name": "useVFolderInvitationsSharesQuery",
    "operationKind": "query",
    "text": "query useVFolderInvitationsSharesQuery {\n  myEntityShares(sides: [RECIPIENT], limit: 100) {\n    edges {\n      node {\n        entityId\n        permissions\n        id\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "9f8e124597fb022020b5ba7c5e683f8b";

export default node;

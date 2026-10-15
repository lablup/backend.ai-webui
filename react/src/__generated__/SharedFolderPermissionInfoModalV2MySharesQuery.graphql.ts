/**
 * @generated SignedSource<<68c639ebc8c749dfafaf37eaf5228842>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type EntityShareStatus = "ACCEPTED" | "CANCELED" | "PENDING" | "REJECTED" | "REVOKED" | "%future added value";
export type SharedFolderPermissionInfoModalV2MySharesQuery$variables = Record<PropertyKey, never>;
export type SharedFolderPermissionInfoModalV2MySharesQuery$data = {
  readonly myEntityShares: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly entityId: string;
        readonly status: EntityShareStatus;
        readonly targetEntityId: string;
        readonly targetEntityType: string;
      };
    }>;
  } | null | undefined;
};
export type SharedFolderPermissionInfoModalV2MySharesQuery = {
  response: SharedFolderPermissionInfoModalV2MySharesQuery$data;
  variables: SharedFolderPermissionInfoModalV2MySharesQuery$variables;
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
  "name": "targetEntityType",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "targetEntityId",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "status",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "SharedFolderPermissionInfoModalV2MySharesQuery",
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
                  (v3/*: any*/),
                  (v4/*: any*/)
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
    "name": "SharedFolderPermissionInfoModalV2MySharesQuery",
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
                  (v3/*: any*/),
                  (v4/*: any*/),
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
    "cacheID": "610a7e07258becd8d67bdbe67f750182",
    "id": null,
    "metadata": {},
    "name": "SharedFolderPermissionInfoModalV2MySharesQuery",
    "operationKind": "query",
    "text": "query SharedFolderPermissionInfoModalV2MySharesQuery {\n  myEntityShares(sides: [RECIPIENT], limit: 100) {\n    edges {\n      node {\n        entityId\n        targetEntityType\n        targetEntityId\n        status\n        id\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "1a58a35ee6f04d81eda6ada80f0f15de";

export default node;

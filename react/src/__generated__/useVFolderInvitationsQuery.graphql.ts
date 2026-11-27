/**
 * @generated SignedSource<<df3e8a87970fde1c72f4a5deceb2a8e1>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type EntityShareStatus = "ACCEPTED" | "CANCELED" | "PENDING" | "REJECTED" | "REVOKED" | "%future added value";
export type PermissionBit = "CREATE" | "HARD_DELETE" | "READ" | "SOFT_DELETE" | "UPDATE" | "%future added value";
export type useVFolderInvitationsQuery$variables = Record<PropertyKey, never>;
export type useVFolderInvitationsQuery$data = {
  readonly myEntityShares: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly createdAt: string;
        readonly entityId: string;
        readonly permissions: ReadonlyArray<PermissionBit>;
        readonly sharer: {
          readonly basicInfo: {
            readonly email: string;
          };
        } | null | undefined;
        readonly status: EntityShareStatus;
        readonly targetEntity: {
          readonly __typename: "VFolder";
          readonly metadata: {
            readonly name: string;
          };
        } | {
          // This will never be '%other', but we need some
          // value in case none of the concrete values match.
          readonly __typename: "%other";
        } | null | undefined;
        readonly targetEntityId: string;
        readonly targetEntityType: string;
      };
    }>;
  } | null | undefined;
};
export type useVFolderInvitationsQuery = {
  response: useVFolderInvitationsQuery$data;
  variables: useVFolderInvitationsQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "filter",
    "value": {
      "status": {
        "equals": "PENDING"
      }
    }
  },
  {
    "kind": "Literal",
    "name": "limit",
    "value": 100
  },
  {
    "kind": "Literal",
    "name": "orderBy",
    "value": [
      {
        "direction": "DESC",
        "field": "CREATED_AT"
      }
    ]
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
  "name": "status",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "permissions",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "targetEntityType",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "targetEntityId",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "createdAt",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "concreteType": "UserV2BasicInfo",
  "kind": "LinkedField",
  "name": "basicInfo",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "email",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v9 = {
  "kind": "InlineFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "VFolderMetadataInfo",
      "kind": "LinkedField",
      "name": "metadata",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "name",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "VFolder",
  "abstractKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v11 = [
  (v10/*: any*/)
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "useVFolderInvitationsQuery",
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
                  (v5/*: any*/),
                  (v6/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "UserV2",
                    "kind": "LinkedField",
                    "name": "sharer",
                    "plural": false,
                    "selections": [
                      (v7/*: any*/)
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": null,
                    "kind": "LinkedField",
                    "name": "targetEntity",
                    "plural": false,
                    "selections": [
                      (v8/*: any*/),
                      (v9/*: any*/)
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
        "storageKey": "myEntityShares(filter:{\"status\":{\"equals\":\"PENDING\"}},limit:100,orderBy:[{\"direction\":\"DESC\",\"field\":\"CREATED_AT\"}],sides:[\"RECIPIENT\"])"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "useVFolderInvitationsQuery",
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
                  (v5/*: any*/),
                  (v6/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "UserV2",
                    "kind": "LinkedField",
                    "name": "sharer",
                    "plural": false,
                    "selections": [
                      (v7/*: any*/),
                      (v10/*: any*/)
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": null,
                    "kind": "LinkedField",
                    "name": "targetEntity",
                    "plural": false,
                    "selections": [
                      (v8/*: any*/),
                      (v9/*: any*/),
                      {
                        "kind": "InlineFragment",
                        "selections": (v11/*: any*/),
                        "type": "Node",
                        "abstractKey": "__isNode"
                      },
                      {
                        "kind": "InlineFragment",
                        "selections": (v11/*: any*/),
                        "type": "ArtifactRegistry",
                        "abstractKey": null
                      }
                    ],
                    "storageKey": null
                  },
                  (v10/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": "myEntityShares(filter:{\"status\":{\"equals\":\"PENDING\"}},limit:100,orderBy:[{\"direction\":\"DESC\",\"field\":\"CREATED_AT\"}],sides:[\"RECIPIENT\"])"
      }
    ]
  },
  "params": {
    "cacheID": "59c30f2ab8d4319c9061ce34e21d7f28",
    "id": null,
    "metadata": {},
    "name": "useVFolderInvitationsQuery",
    "operationKind": "query",
    "text": "query useVFolderInvitationsQuery {\n  myEntityShares(sides: [RECIPIENT], filter: {status: {equals: PENDING}}, orderBy: [{field: CREATED_AT, direction: \"DESC\"}], limit: 100) {\n    edges {\n      node {\n        entityId\n        status\n        permissions\n        targetEntityType\n        targetEntityId\n        createdAt\n        sharer {\n          basicInfo {\n            email\n          }\n          id\n        }\n        targetEntity {\n          __typename\n          ... on VFolder {\n            metadata {\n              name\n            }\n          }\n          ... on Node {\n            __isNode: __typename\n            id\n          }\n          ... on ArtifactRegistry {\n            id\n          }\n        }\n        id\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "cfc89c0bad7f355cdb962928b147a345";

export default node;

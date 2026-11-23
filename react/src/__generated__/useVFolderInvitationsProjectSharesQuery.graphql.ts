/**
 * @generated SignedSource<<81c3e97e26f3bb3a0bcff7b66c7ff98d>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type EntityShareStatus = "ACCEPTED" | "CANCELED" | "PENDING" | "REJECTED" | "REVOKED" | "%future added value";
export type PermissionBit = "CREATE" | "HARD_DELETE" | "READ" | "SOFT_DELETE" | "UPDATE" | "%future added value";
export type UUIDScope = {
  value: string;
};
export type useVFolderInvitationsProjectSharesQuery$variables = {
  projects: ReadonlyArray<UUIDScope>;
};
export type useVFolderInvitationsProjectSharesQuery$data = {
  readonly entityShares: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly createdAt: string;
        readonly entityId: string;
        readonly permissions: ReadonlyArray<PermissionBit>;
        readonly recipientEntity: {
          readonly __typename: "ProjectV2";
          readonly basicInfo: {
            readonly name: string;
          };
        } | {
          // This will never be '%other', but we need some
          // value in case none of the concrete values match.
          readonly __typename: "%other";
        } | null | undefined;
        readonly recipientEntityId: string | null | undefined;
        readonly recipientEntityType: string | null | undefined;
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
export type useVFolderInvitationsProjectSharesQuery = {
  response: useVFolderInvitationsProjectSharesQuery$data;
  variables: useVFolderInvitationsProjectSharesQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "projects"
  }
],
v1 = [
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
    "fields": [
      {
        "kind": "Variable",
        "name": "recipientProject",
        "variableName": "projects"
      }
    ],
    "kind": "ObjectValue",
    "name": "scope"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "entityId",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "status",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "permissions",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "targetEntityType",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "targetEntityId",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "createdAt",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "recipientEntityType",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "recipientEntityId",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v11 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "name",
    "storageKey": null
  }
],
v12 = {
  "kind": "InlineFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "ProjectBasicInfo",
      "kind": "LinkedField",
      "name": "basicInfo",
      "plural": false,
      "selections": (v11/*: any*/),
      "storageKey": null
    }
  ],
  "type": "ProjectV2",
  "abstractKey": null
},
v13 = {
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
v14 = {
  "kind": "InlineFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "VFolderMetadataInfo",
      "kind": "LinkedField",
      "name": "metadata",
      "plural": false,
      "selections": (v11/*: any*/),
      "storageKey": null
    }
  ],
  "type": "VFolder",
  "abstractKey": null
},
v15 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v16 = [
  (v15/*: any*/)
],
v17 = {
  "kind": "InlineFragment",
  "selections": (v16/*: any*/),
  "type": "Node",
  "abstractKey": "__isNode"
},
v18 = {
  "kind": "InlineFragment",
  "selections": (v16/*: any*/),
  "type": "ArtifactRegistry",
  "abstractKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "useVFolderInvitationsProjectSharesQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "EntityShareConnection",
        "kind": "LinkedField",
        "name": "entityShares",
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
                  (v2/*: any*/),
                  (v3/*: any*/),
                  (v4/*: any*/),
                  (v5/*: any*/),
                  (v6/*: any*/),
                  (v7/*: any*/),
                  (v8/*: any*/),
                  (v9/*: any*/),
                  {
                    "kind": "CatchField",
                    "field": {
                      "alias": null,
                      "args": null,
                      "concreteType": null,
                      "kind": "LinkedField",
                      "name": "recipientEntity",
                      "plural": false,
                      "selections": [
                        (v10/*: any*/),
                        (v12/*: any*/)
                      ],
                      "storageKey": null
                    },
                    "to": "NULL"
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "UserV2",
                    "kind": "LinkedField",
                    "name": "sharer",
                    "plural": false,
                    "selections": [
                      (v13/*: any*/)
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
                      (v10/*: any*/),
                      (v14/*: any*/)
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
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "useVFolderInvitationsProjectSharesQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "EntityShareConnection",
        "kind": "LinkedField",
        "name": "entityShares",
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
                  (v2/*: any*/),
                  (v3/*: any*/),
                  (v4/*: any*/),
                  (v5/*: any*/),
                  (v6/*: any*/),
                  (v7/*: any*/),
                  (v8/*: any*/),
                  (v9/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": null,
                    "kind": "LinkedField",
                    "name": "recipientEntity",
                    "plural": false,
                    "selections": [
                      (v10/*: any*/),
                      (v12/*: any*/),
                      (v17/*: any*/),
                      (v18/*: any*/)
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "UserV2",
                    "kind": "LinkedField",
                    "name": "sharer",
                    "plural": false,
                    "selections": [
                      (v13/*: any*/),
                      (v15/*: any*/)
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
                      (v10/*: any*/),
                      (v14/*: any*/),
                      (v17/*: any*/),
                      (v18/*: any*/)
                    ],
                    "storageKey": null
                  },
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
    ]
  },
  "params": {
    "cacheID": "35580ca1bec8a24be0414d8d61ee5ce7",
    "id": null,
    "metadata": {},
    "name": "useVFolderInvitationsProjectSharesQuery",
    "operationKind": "query",
    "text": "query useVFolderInvitationsProjectSharesQuery(\n  $projects: [UUIDScope!]!\n) {\n  entityShares(scope: {recipientProject: $projects}, filter: {status: {equals: PENDING}}, orderBy: [{field: CREATED_AT, direction: \"DESC\"}], limit: 100) {\n    edges {\n      node {\n        entityId\n        status\n        permissions\n        targetEntityType\n        targetEntityId\n        createdAt\n        recipientEntityType\n        recipientEntityId\n        recipientEntity {\n          __typename\n          ... on ProjectV2 {\n            basicInfo {\n              name\n            }\n          }\n          ... on Node {\n            __isNode: __typename\n            id\n          }\n          ... on ArtifactRegistry {\n            id\n          }\n        }\n        sharer {\n          basicInfo {\n            email\n          }\n          id\n        }\n        targetEntity {\n          __typename\n          ... on VFolder {\n            metadata {\n              name\n            }\n          }\n          ... on Node {\n            __isNode: __typename\n            id\n          }\n          ... on ArtifactRegistry {\n            id\n          }\n        }\n        id\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "5f23abec4f4a5d7424b15a897fe7aef0";

export default node;

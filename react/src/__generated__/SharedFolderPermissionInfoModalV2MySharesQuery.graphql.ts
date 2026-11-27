/**
 * @generated SignedSource<<c850125dbfd9517a8403b455d00b5882>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type PermissionBit = "CREATE" | "HARD_DELETE" | "READ" | "SOFT_DELETE" | "UPDATE" | "%future added value";
export type PermissionTarget = {
  entityType: string;
  scopeId: string;
  scopeType: string;
};
export type SharedFolderPermissionInfoModalV2MySharesQuery$variables = {
  folderId: string;
  userScope: PermissionTarget;
};
export type SharedFolderPermissionInfoModalV2MySharesQuery$data = {
  readonly myEntityShares: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly entityId: string;
        readonly targetEntityType: string;
      };
    }>;
  } | null | undefined;
  readonly myScopePermissions: {
    readonly item: {
      readonly permissions: ReadonlyArray<PermissionBit>;
    };
  } | null | undefined;
};
export type SharedFolderPermissionInfoModalV2MySharesQuery = {
  response: SharedFolderPermissionInfoModalV2MySharesQuery$data;
  variables: SharedFolderPermissionInfoModalV2MySharesQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "folderId"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "userScope"
  }
],
v1 = [
  {
    "fields": [
      {
        "kind": "Literal",
        "name": "status",
        "value": {
          "equals": "ACCEPTED"
        }
      },
      {
        "fields": [
          {
            "kind": "Variable",
            "name": "equals",
            "variableName": "folderId"
          }
        ],
        "kind": "ObjectValue",
        "name": "targetEntityId"
      }
    ],
    "kind": "ObjectValue",
    "name": "filter"
  },
  {
    "kind": "Literal",
    "name": "limit",
    "value": 1
  },
  {
    "kind": "Literal",
    "name": "sides",
    "value": [
      "RECIPIENT"
    ]
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
  "name": "targetEntityType",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": [
    {
      "fields": [
        {
          "kind": "Variable",
          "name": "target",
          "variableName": "userScope"
        }
      ],
      "kind": "ObjectValue",
      "name": "input"
    }
  ],
  "concreteType": "MyScopePermissionsPayload",
  "kind": "LinkedField",
  "name": "myScopePermissions",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "ScopeEntityPermission",
      "kind": "LinkedField",
      "name": "item",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "permissions",
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
    "name": "SharedFolderPermissionInfoModalV2MySharesQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
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
                  (v2/*: any*/),
                  (v3/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      (v4/*: any*/)
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "SharedFolderPermissionInfoModalV2MySharesQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
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
                  (v2/*: any*/),
                  (v3/*: any*/),
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
      },
      (v4/*: any*/)
    ]
  },
  "params": {
    "cacheID": "3b4e7bfce51abc4485c2782de2d7a283",
    "id": null,
    "metadata": {},
    "name": "SharedFolderPermissionInfoModalV2MySharesQuery",
    "operationKind": "query",
    "text": "query SharedFolderPermissionInfoModalV2MySharesQuery(\n  $folderId: UUID!\n  $userScope: PermissionTarget!\n) {\n  myEntityShares(sides: [RECIPIENT], filter: {targetEntityId: {equals: $folderId}, status: {equals: ACCEPTED}}, limit: 1) {\n    edges {\n      node {\n        entityId\n        targetEntityType\n        id\n      }\n    }\n  }\n  myScopePermissions(input: {target: $userScope}) {\n    item {\n      permissions\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "eebb70dd1f5da06f26c9299787fb9668";

export default node;

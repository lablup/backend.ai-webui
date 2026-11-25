/**
 * @generated SignedSource<<a607bf20d15f075edeadf2d6731479ee>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type SharedFolderPermissionInfoModalV2MySharesQuery$variables = {
  folderId: string;
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
  readonly myUserV2: {
    readonly projects: {
      readonly edges: ReadonlyArray<{
        readonly node: {
          readonly basicInfo: {
            readonly name: string;
          };
          readonly entityId: string;
        };
      }>;
    } | null | undefined;
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
v4 = [
  {
    "kind": "Literal",
    "name": "filter",
    "value": {
      "isActive": true
    }
  },
  {
    "kind": "Literal",
    "name": "limit",
    "value": 100
  }
],
v5 = {
  "alias": null,
  "args": null,
  "concreteType": "ProjectBasicInfo",
  "kind": "LinkedField",
  "name": "basicInfo",
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
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
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
      {
        "alias": null,
        "args": null,
        "concreteType": "UserV2",
        "kind": "LinkedField",
        "name": "myUserV2",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": (v4/*: any*/),
            "concreteType": "ProjectV2Connection",
            "kind": "LinkedField",
            "name": "projects",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "ProjectV2Edge",
                "kind": "LinkedField",
                "name": "edges",
                "plural": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "ProjectV2",
                    "kind": "LinkedField",
                    "name": "node",
                    "plural": false,
                    "selections": [
                      (v2/*: any*/),
                      (v5/*: any*/)
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": "projects(filter:{\"isActive\":true},limit:100)"
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
                  (v6/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "UserV2",
        "kind": "LinkedField",
        "name": "myUserV2",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": (v4/*: any*/),
            "concreteType": "ProjectV2Connection",
            "kind": "LinkedField",
            "name": "projects",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "ProjectV2Edge",
                "kind": "LinkedField",
                "name": "edges",
                "plural": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "ProjectV2",
                    "kind": "LinkedField",
                    "name": "node",
                    "plural": false,
                    "selections": [
                      (v2/*: any*/),
                      (v5/*: any*/),
                      (v6/*: any*/)
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": "projects(filter:{\"isActive\":true},limit:100)"
          },
          (v6/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "f6269e0e0fdd337cd341dc43bed971c0",
    "id": null,
    "metadata": {},
    "name": "SharedFolderPermissionInfoModalV2MySharesQuery",
    "operationKind": "query",
    "text": "query SharedFolderPermissionInfoModalV2MySharesQuery(\n  $folderId: UUID!\n) {\n  myEntityShares(sides: [RECIPIENT], filter: {targetEntityId: {equals: $folderId}, status: {equals: ACCEPTED}}, limit: 1) {\n    edges {\n      node {\n        entityId\n        targetEntityType\n        id\n      }\n    }\n  }\n  myUserV2 {\n    projects(filter: {isActive: true}, limit: 100) {\n      edges {\n        node {\n          entityId\n          basicInfo {\n            name\n          }\n          id\n        }\n      }\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "68d9ada4650353a0f7cf3b60faab70a1";

export default node;

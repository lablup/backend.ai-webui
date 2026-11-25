/**
 * @generated SignedSource<<15c1508291972817e855d5f4ea49e5aa>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type UUIDScope = {
  value: string;
};
export type SharedFolderPermissionInfoModalV2ProjectSharesQuery$variables = {
  folderId: string;
  projects: ReadonlyArray<UUIDScope>;
};
export type SharedFolderPermissionInfoModalV2ProjectSharesQuery$data = {
  readonly entityShares: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly entityId: string;
        readonly targetEntityType: string;
      };
    }>;
  } | null | undefined;
};
export type SharedFolderPermissionInfoModalV2ProjectSharesQuery = {
  response: SharedFolderPermissionInfoModalV2ProjectSharesQuery$data;
  variables: SharedFolderPermissionInfoModalV2ProjectSharesQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "folderId"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "projects"
},
v2 = [
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
  "name": "targetEntityType",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "SharedFolderPermissionInfoModalV2ProjectSharesQuery",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
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
                  (v3/*: any*/),
                  (v4/*: any*/)
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
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "SharedFolderPermissionInfoModalV2ProjectSharesQuery",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
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
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "764a3316c3c436bf4a3bdc37db30330f",
    "id": null,
    "metadata": {},
    "name": "SharedFolderPermissionInfoModalV2ProjectSharesQuery",
    "operationKind": "query",
    "text": "query SharedFolderPermissionInfoModalV2ProjectSharesQuery(\n  $projects: [UUIDScope!]!\n  $folderId: UUID!\n) {\n  entityShares(scope: {recipientProject: $projects}, filter: {targetEntityId: {equals: $folderId}, status: {equals: ACCEPTED}}, limit: 1) {\n    edges {\n      node {\n        entityId\n        targetEntityType\n        id\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "8e827d90d6941fa5449b5774976f6b34";

export default node;

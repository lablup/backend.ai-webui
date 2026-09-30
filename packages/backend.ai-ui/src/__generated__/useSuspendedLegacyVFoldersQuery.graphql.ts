/**
 * @generated SignedSource<<61afe768cf65bf35e21351ec7b32ee47>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type VFolderMountPermission = "NONE" | "READ_ONLY" | "READ_WRITE" | "RW_DELETE" | "%future added value";
export type VFolderOperationStatus = "CLONING" | "DELETE_COMPLETE" | "DELETE_ERROR" | "DELETE_ONGOING" | "DELETE_PENDING" | "READY" | "%future added value";
export type VFolderOwnershipType = "GROUP" | "USER" | "%future added value";
export type VFolderUsageMode = "DATA" | "GENERAL" | "MODEL" | "%future added value";
export type useSuspendedLegacyVFoldersQuery$variables = {
  limit: number;
  offset: number;
};
export type useSuspendedLegacyVFoldersQuery$data = {
  readonly myVfolders: {
    readonly count: number;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly accessControl: {
          readonly ownershipType: VFolderOwnershipType;
          readonly permission: VFolderMountPermission;
        };
        readonly host: string;
        readonly id: string;
        readonly metadata: {
          readonly cloneable: boolean;
          readonly createdAt: string;
          readonly name: string;
          readonly quotaScopeId: string | null | undefined;
          readonly usageMode: VFolderUsageMode;
        };
        readonly ownership: {
          readonly creatorEmail: string | null | undefined;
          readonly projectId: string | null | undefined;
          readonly userId: string | null | undefined;
        };
        readonly status: VFolderOperationStatus;
      };
    }>;
  } | null | undefined;
};
export type useSuspendedLegacyVFoldersQuery = {
  response: useSuspendedLegacyVFoldersQuery$data;
  variables: useSuspendedLegacyVFoldersQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "limit"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "offset"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "limit",
        "variableName": "limit"
      },
      {
        "kind": "Variable",
        "name": "offset",
        "variableName": "offset"
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
      }
    ],
    "concreteType": "VFolderConnection",
    "kind": "LinkedField",
    "name": "myVfolders",
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
        "concreteType": "VFolderEdge",
        "kind": "LinkedField",
        "name": "edges",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "VFolder",
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
                "name": "status",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "host",
                "storageKey": null
              },
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
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "usageMode",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "quotaScopeId",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "createdAt",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "cloneable",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "VFolderAccessControlInfo",
                "kind": "LinkedField",
                "name": "accessControl",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "permission",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "ownershipType",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "VFolderOwnershipInfo",
                "kind": "LinkedField",
                "name": "ownership",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "userId",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "projectId",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "creatorEmail",
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
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "useSuspendedLegacyVFoldersQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "useSuspendedLegacyVFoldersQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "3156dfe35fbde1ebdc2bcf349ec06d36",
    "id": null,
    "metadata": {},
    "name": "useSuspendedLegacyVFoldersQuery",
    "operationKind": "query",
    "text": "query useSuspendedLegacyVFoldersQuery(\n  $limit: Int!\n  $offset: Int!\n) {\n  myVfolders(limit: $limit, offset: $offset, orderBy: [{field: CREATED_AT, direction: DESC}]) @since(version: \"26.4.2\") {\n    count\n    edges {\n      node {\n        id\n        status\n        host\n        metadata {\n          name\n          usageMode\n          quotaScopeId\n          createdAt\n          cloneable\n        }\n        accessControl {\n          permission\n          ownershipType\n        }\n        ownership {\n          userId\n          projectId\n          creatorEmail\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "c587d65c7a4c152a4c5f3f08f7a5b3a8";

export default node;

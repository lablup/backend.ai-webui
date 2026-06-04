/**
 * @generated SignedSource<<abd79c9911ccfee4a4cdb0a98d1035dd>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type VFolderHostPermissionV2 = "CREATE_VFOLDER" | "DELETE_VFOLDER" | "DOWNLOAD_FILE" | "INVITE_OTHERS" | "MODIFY_VFOLDER" | "MOUNT_IN_SESSION" | "SET_USER_PERM" | "UPLOAD_FILE" | "%future added value";
export type KeypairResourcePolicyStoragePermissionTableQuery$variables = {
  names: ReadonlyArray<string>;
  skip: boolean;
};
export type KeypairResourcePolicyStoragePermissionTableQuery$data = {
  readonly adminKeypairResourcePoliciesV2?: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly allowedVfolderHosts: ReadonlyArray<{
          readonly host: string;
          readonly permissions: ReadonlyArray<VFolderHostPermissionV2>;
        }>;
        readonly id: string;
        readonly name: string;
      };
    }>;
  } | null | undefined;
};
export type KeypairResourcePolicyStoragePermissionTableQuery = {
  response: KeypairResourcePolicyStoragePermissionTableQuery$data;
  variables: KeypairResourcePolicyStoragePermissionTableQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "names"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "skip"
  }
],
v1 = [
  {
    "condition": "skip",
    "kind": "Condition",
    "passingValue": false,
    "selections": [
      {
        "alias": null,
        "args": [
          {
            "fields": [
              {
                "fields": [
                  {
                    "kind": "Variable",
                    "name": "in",
                    "variableName": "names"
                  }
                ],
                "kind": "ObjectValue",
                "name": "name"
              }
            ],
            "kind": "ObjectValue",
            "name": "filter"
          },
          {
            "kind": "Literal",
            "name": "limit",
            "value": 10
          }
        ],
        "concreteType": "KeypairResourcePolicyV2Connection",
        "kind": "LinkedField",
        "name": "adminKeypairResourcePoliciesV2",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "KeypairResourcePolicyV2Edge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "KeypairResourcePolicyV2",
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
                    "concreteType": "VFolderHostPermissionEntry",
                    "kind": "LinkedField",
                    "name": "allowedVfolderHosts",
                    "plural": true,
                    "selections": [
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
                        "kind": "ScalarField",
                        "name": "permissions",
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
    ]
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "KeypairResourcePolicyStoragePermissionTableQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "KeypairResourcePolicyStoragePermissionTableQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "439f13931f2e1e8fe663825b5bad5a55",
    "id": null,
    "metadata": {},
    "name": "KeypairResourcePolicyStoragePermissionTableQuery",
    "operationKind": "query",
    "text": "query KeypairResourcePolicyStoragePermissionTableQuery(\n  $names: [String!]!\n  $skip: Boolean!\n) {\n  adminKeypairResourcePoliciesV2(filter: {name: {in: $names}}, limit: 10) @skip(if: $skip) {\n    edges {\n      node {\n        id\n        name\n        allowedVfolderHosts {\n          host\n          permissions\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "c7396bebbbe0fd0a7b54fa2c5e9f9ac8";

export default node;

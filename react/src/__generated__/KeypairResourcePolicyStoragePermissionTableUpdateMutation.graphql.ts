/**
 * @generated SignedSource<<0784827bf2bee46ef5778fb7c3355da7>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type VFolderHostPermissionV2 = "CREATE_VFOLDER" | "DELETE_VFOLDER" | "DOWNLOAD_FILE" | "INVITE_OTHERS" | "MODIFY_VFOLDER" | "MOUNT_IN_SESSION" | "SET_USER_PERM" | "UPLOAD_FILE" | "%future added value";
export type UpdateKeypairResourcePolicyInput = {
  allowedVfolderHosts?: ReadonlyArray<VFolderHostPermissionEntryInput> | null | undefined;
  defaultForUnspecified?: string | null | undefined;
  idleTimeout?: number | null | undefined;
  maxConcurrentSessions?: number | null | undefined;
  maxConcurrentSftpSessions?: number | null | undefined;
  maxContainersPerSession?: number | null | undefined;
  maxPendingSessionCount?: number | null | undefined;
  maxPendingSessionResourceSlots?: ReadonlyArray<ResourceSlotEntryInput> | null | undefined;
  maxSessionLifetime?: number | null | undefined;
  totalResourceSlots?: ReadonlyArray<ResourceSlotEntryInput> | null | undefined;
};
export type ResourceSlotEntryInput = {
  quantity: string;
  resourceType: string;
};
export type VFolderHostPermissionEntryInput = {
  host: string;
  permissions: ReadonlyArray<string>;
};
export type KeypairResourcePolicyStoragePermissionTableUpdateMutation$variables = {
  input: UpdateKeypairResourcePolicyInput;
  name: string;
};
export type KeypairResourcePolicyStoragePermissionTableUpdateMutation$data = {
  readonly adminUpdateKeypairResourcePolicyV2: {
    readonly keypairResourcePolicy: {
      readonly allowedVfolderHosts: ReadonlyArray<{
        readonly host: string;
        readonly permissions: ReadonlyArray<VFolderHostPermissionV2>;
      }>;
      readonly id: string;
    };
  } | null | undefined;
};
export type KeypairResourcePolicyStoragePermissionTableUpdateMutation = {
  response: KeypairResourcePolicyStoragePermissionTableUpdateMutation$data;
  variables: KeypairResourcePolicyStoragePermissionTableUpdateMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "input"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "name"
},
v2 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      },
      {
        "kind": "Variable",
        "name": "name",
        "variableName": "name"
      }
    ],
    "concreteType": "UpdateKeypairResourcePolicyPayload",
    "kind": "LinkedField",
    "name": "adminUpdateKeypairResourcePolicyV2",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "KeypairResourcePolicyV2",
        "kind": "LinkedField",
        "name": "keypairResourcePolicy",
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
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "KeypairResourcePolicyStoragePermissionTableUpdateMutation",
    "selections": (v2/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "KeypairResourcePolicyStoragePermissionTableUpdateMutation",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "7e584ad4f67771aade7d7bac4fc555ce",
    "id": null,
    "metadata": {},
    "name": "KeypairResourcePolicyStoragePermissionTableUpdateMutation",
    "operationKind": "mutation",
    "text": "mutation KeypairResourcePolicyStoragePermissionTableUpdateMutation(\n  $name: String!\n  $input: UpdateKeypairResourcePolicyInput!\n) {\n  adminUpdateKeypairResourcePolicyV2(name: $name, input: $input) {\n    keypairResourcePolicy {\n      id\n      allowedVfolderHosts {\n        host\n        permissions\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "88771b159e02a1b858d3f8aafea9262a";

export default node;

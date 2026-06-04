/**
 * @generated SignedSource<<10e38611ce8de59486a435a84fcb8025>>
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
export type KeypairResourcePolicyStoragePermissionTableV2UpdateMutation$variables = {
  input: UpdateKeypairResourcePolicyInput;
  name: string;
};
export type KeypairResourcePolicyStoragePermissionTableV2UpdateMutation$data = {
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
export type KeypairResourcePolicyStoragePermissionTableV2UpdateMutation = {
  response: KeypairResourcePolicyStoragePermissionTableV2UpdateMutation$data;
  variables: KeypairResourcePolicyStoragePermissionTableV2UpdateMutation$variables;
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
    "name": "KeypairResourcePolicyStoragePermissionTableV2UpdateMutation",
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
    "name": "KeypairResourcePolicyStoragePermissionTableV2UpdateMutation",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "b32c683c848359e0df4639c78848c9e0",
    "id": null,
    "metadata": {},
    "name": "KeypairResourcePolicyStoragePermissionTableV2UpdateMutation",
    "operationKind": "mutation",
    "text": "mutation KeypairResourcePolicyStoragePermissionTableV2UpdateMutation(\n  $name: String!\n  $input: UpdateKeypairResourcePolicyInput!\n) {\n  adminUpdateKeypairResourcePolicyV2(name: $name, input: $input) {\n    keypairResourcePolicy {\n      id\n      allowedVfolderHosts {\n        host\n        permissions\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "77b6178578d763b06b51385effda09f6";

export default node;

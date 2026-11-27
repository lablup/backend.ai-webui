/**
 * @generated SignedSource<<f017a1966f89ba4fbb71a6834c8c9432>>
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
  maxPriority?: number | null | undefined;
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
  id: string;
  input: UpdateKeypairResourcePolicyInput;
};
export type KeypairResourcePolicyStoragePermissionTableV2UpdateMutation$data = {
  readonly updateKeypairResourcePolicyV2: {
    readonly keypairResourcePolicy: {
      readonly allowedVfolderHosts: ReadonlyArray<{
        readonly host: string;
        readonly permissions: ReadonlyArray<VFolderHostPermissionV2>;
      }>;
      readonly id: string;
    };
  };
};
export type KeypairResourcePolicyStoragePermissionTableV2UpdateMutation = {
  response: KeypairResourcePolicyStoragePermissionTableV2UpdateMutation$data;
  variables: KeypairResourcePolicyStoragePermissionTableV2UpdateMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "id",
        "variableName": "id"
      },
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "UpdateKeypairResourcePolicyPayload",
    "kind": "LinkedField",
    "name": "updateKeypairResourcePolicyV2",
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "KeypairResourcePolicyStoragePermissionTableV2UpdateMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "KeypairResourcePolicyStoragePermissionTableV2UpdateMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "4166b0d348db53d23dea3fda5b942151",
    "id": null,
    "metadata": {},
    "name": "KeypairResourcePolicyStoragePermissionTableV2UpdateMutation",
    "operationKind": "mutation",
    "text": "mutation KeypairResourcePolicyStoragePermissionTableV2UpdateMutation(\n  $id: UUID!\n  $input: UpdateKeypairResourcePolicyInput!\n) {\n  updateKeypairResourcePolicyV2(id: $id, input: $input) {\n    keypairResourcePolicy {\n      id\n      allowedVfolderHosts {\n        host\n        permissions\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "1edbd6b2918155378d20cbdd6a2c64af";

export default node;

/**
 * @generated SignedSource<<4897f9f5b7cd72d4e9babe7711d78579>>
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
export type KeypairResourcePolicyV2SettingModalModifyMutation$variables = {
  input: UpdateKeypairResourcePolicyInput;
  name: string;
};
export type KeypairResourcePolicyV2SettingModalModifyMutation$data = {
  readonly adminUpdateKeypairResourcePolicyV2: {
    readonly keypairResourcePolicy: {
      readonly allowedVfolderHosts: ReadonlyArray<{
        readonly host: string;
        readonly permissions: ReadonlyArray<VFolderHostPermissionV2>;
      }>;
      readonly createdAt: string | null | undefined;
      readonly defaultForUnspecified: string;
      readonly id: string;
      readonly idleTimeout: number;
      readonly maxConcurrentSessions: number;
      readonly maxConcurrentSftpSessions: number;
      readonly maxContainersPerSession: number;
      readonly maxPendingSessionCount: number | null | undefined;
      readonly maxPendingSessionResourceSlots: ReadonlyArray<{
        readonly quantity: any | null | undefined;
        readonly resourceType: string;
        readonly unlimited: boolean;
      }> | null | undefined;
      readonly maxSessionLifetime: number;
      readonly name: string;
      readonly totalResourceSlots: ReadonlyArray<{
        readonly quantity: any | null | undefined;
        readonly resourceType: string;
        readonly unlimited: boolean;
      }>;
    };
  } | null | undefined;
};
export type KeypairResourcePolicyV2SettingModalModifyMutation = {
  response: KeypairResourcePolicyV2SettingModalModifyMutation$data;
  variables: KeypairResourcePolicyV2SettingModalModifyMutation$variables;
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
    "args": null,
    "kind": "ScalarField",
    "name": "resourceType",
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "quantity",
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "unlimited",
    "storageKey": null
  }
],
v3 = [
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
            "kind": "ScalarField",
            "name": "name",
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
            "name": "defaultForUnspecified",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "ResourceLimitEntry",
            "kind": "LinkedField",
            "name": "totalResourceSlots",
            "plural": true,
            "selections": (v2/*: any*/),
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "maxSessionLifetime",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "maxConcurrentSessions",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "maxPendingSessionCount",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "ResourceLimitEntry",
            "kind": "LinkedField",
            "name": "maxPendingSessionResourceSlots",
            "plural": true,
            "selections": (v2/*: any*/),
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "maxConcurrentSftpSessions",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "maxContainersPerSession",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "idleTimeout",
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
    "name": "KeypairResourcePolicyV2SettingModalModifyMutation",
    "selections": (v3/*: any*/),
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
    "name": "KeypairResourcePolicyV2SettingModalModifyMutation",
    "selections": (v3/*: any*/)
  },
  "params": {
    "cacheID": "44e36db821eafc2b3a5eb3a7c46e4b61",
    "id": null,
    "metadata": {},
    "name": "KeypairResourcePolicyV2SettingModalModifyMutation",
    "operationKind": "mutation",
    "text": "mutation KeypairResourcePolicyV2SettingModalModifyMutation(\n  $name: String!\n  $input: UpdateKeypairResourcePolicyInput!\n) {\n  adminUpdateKeypairResourcePolicyV2(name: $name, input: $input) {\n    keypairResourcePolicy {\n      id\n      name\n      createdAt\n      defaultForUnspecified\n      totalResourceSlots {\n        resourceType\n        quantity\n        unlimited\n      }\n      maxSessionLifetime\n      maxConcurrentSessions\n      maxPendingSessionCount\n      maxPendingSessionResourceSlots {\n        resourceType\n        quantity\n        unlimited\n      }\n      maxConcurrentSftpSessions\n      maxContainersPerSession\n      idleTimeout\n      allowedVfolderHosts {\n        host\n        permissions\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "efbe7900175ab6be4af3c27a35689b9f";

export default node;

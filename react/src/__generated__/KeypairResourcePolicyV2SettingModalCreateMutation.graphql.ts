/**
 * @generated SignedSource<<9ed73abd057740240e8076d328d69603>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type CreateKeypairResourcePolicyInput = {
  allowedVfolderHosts: ReadonlyArray<VFolderHostPermissionEntryInput>;
  defaultForUnspecified: string;
  idleTimeout: number;
  maxConcurrentSessions: number;
  maxConcurrentSftpSessions?: number;
  maxContainersPerSession: number;
  maxPendingSessionCount?: number | null | undefined;
  maxPendingSessionResourceSlots?: ReadonlyArray<ResourceSlotEntryInput> | null | undefined;
  maxSessionLifetime: number;
  name: string;
  totalResourceSlots: ReadonlyArray<ResourceSlotEntryInput>;
};
export type ResourceSlotEntryInput = {
  quantity: string;
  resourceType: string;
};
export type VFolderHostPermissionEntryInput = {
  host: string;
  permissions: ReadonlyArray<string>;
};
export type KeypairResourcePolicyV2SettingModalCreateMutation$variables = {
  input: CreateKeypairResourcePolicyInput;
};
export type KeypairResourcePolicyV2SettingModalCreateMutation$data = {
  readonly adminCreateKeypairResourcePolicyV2: {
    readonly keypairResourcePolicy: {
      readonly id: string;
    };
  } | null | undefined;
};
export type KeypairResourcePolicyV2SettingModalCreateMutation = {
  response: KeypairResourcePolicyV2SettingModalCreateMutation$data;
  variables: KeypairResourcePolicyV2SettingModalCreateMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
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
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "CreateKeypairResourcePolicyPayload",
    "kind": "LinkedField",
    "name": "adminCreateKeypairResourcePolicyV2",
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
    "name": "KeypairResourcePolicyV2SettingModalCreateMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "KeypairResourcePolicyV2SettingModalCreateMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "85e11201ff5b0169769108c9d434c8d8",
    "id": null,
    "metadata": {},
    "name": "KeypairResourcePolicyV2SettingModalCreateMutation",
    "operationKind": "mutation",
    "text": "mutation KeypairResourcePolicyV2SettingModalCreateMutation(\n  $input: CreateKeypairResourcePolicyInput!\n) {\n  adminCreateKeypairResourcePolicyV2(input: $input) {\n    keypairResourcePolicy {\n      id\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "40f975fada4293f77a55b8b520443587";

export default node;

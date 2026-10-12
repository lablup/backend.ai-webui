/**
 * @generated SignedSource<<40edea9d2455a84eca92eb43241ac7c6>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type VFolderMountPermission = "NONE" | "READ_ONLY" | "READ_WRITE" | "RW_DELETE" | "%future added value";
export type SetVFolderMountPolicyInput = {
  permission: VFolderMountPermission;
  userId: string;
};
export type InviteFolderSettingModalV2SetMountPolicyMutation$variables = {
  input: SetVFolderMountPolicyInput;
  vfolderId: string;
};
export type InviteFolderSettingModalV2SetMountPolicyMutation$data = {
  readonly setVFolderMountPolicy: {
    readonly policy: {
      readonly id: string;
      readonly permission: VFolderMountPermission;
      readonly userId: string;
    };
  } | null | undefined;
};
export type InviteFolderSettingModalV2SetMountPolicyMutation = {
  response: InviteFolderSettingModalV2SetMountPolicyMutation$data;
  variables: InviteFolderSettingModalV2SetMountPolicyMutation$variables;
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
  "name": "vfolderId"
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
        "name": "vfolderId",
        "variableName": "vfolderId"
      }
    ],
    "concreteType": "SetVFolderMountPolicyPayload",
    "kind": "LinkedField",
    "name": "setVFolderMountPolicy",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "VFolderMountPolicy",
        "kind": "LinkedField",
        "name": "policy",
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
            "name": "userId",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "permission",
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
    "name": "InviteFolderSettingModalV2SetMountPolicyMutation",
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
    "name": "InviteFolderSettingModalV2SetMountPolicyMutation",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "b72525442bb06c6138b505c432e67758",
    "id": null,
    "metadata": {},
    "name": "InviteFolderSettingModalV2SetMountPolicyMutation",
    "operationKind": "mutation",
    "text": "mutation InviteFolderSettingModalV2SetMountPolicyMutation(\n  $vfolderId: UUID!\n  $input: SetVFolderMountPolicyInput!\n) {\n  setVFolderMountPolicy(vfolderId: $vfolderId, input: $input) {\n    policy {\n      id\n      userId\n      permission\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "89cd3db40ce15943ddf5c7d1369b2f36";

export default node;

/**
 * @generated SignedSource<<360a524c570ada9ab12b8231b9a213bc>>
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
export type InviteFolderSettingModalSetMountPolicyMutation$variables = {
  input: SetVFolderMountPolicyInput;
  vfolderId: string;
};
export type InviteFolderSettingModalSetMountPolicyMutation$data = {
  readonly setVFolderMountPolicy: {
    readonly policy: {
      readonly id: string;
      readonly permission: VFolderMountPermission;
      readonly userId: string;
    };
  } | null | undefined;
};
export type InviteFolderSettingModalSetMountPolicyMutation = {
  response: InviteFolderSettingModalSetMountPolicyMutation$data;
  variables: InviteFolderSettingModalSetMountPolicyMutation$variables;
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
    "name": "InviteFolderSettingModalSetMountPolicyMutation",
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
    "name": "InviteFolderSettingModalSetMountPolicyMutation",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "ae92c2b1b0c209d9e191f82bdec0c4f9",
    "id": null,
    "metadata": {},
    "name": "InviteFolderSettingModalSetMountPolicyMutation",
    "operationKind": "mutation",
    "text": "mutation InviteFolderSettingModalSetMountPolicyMutation(\n  $vfolderId: UUID!\n  $input: SetVFolderMountPolicyInput!\n) {\n  setVFolderMountPolicy(vfolderId: $vfolderId, input: $input) {\n    policy {\n      id\n      userId\n      permission\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "5a39226b0d2ef5e24cb78148bee601a5";

export default node;

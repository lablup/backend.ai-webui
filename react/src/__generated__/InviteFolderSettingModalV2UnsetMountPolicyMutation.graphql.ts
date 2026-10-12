/**
 * @generated SignedSource<<9d1ee2aca55fea90d7b7f998a82743cf>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type UnsetVFolderMountPolicyInput = {
  userId: string;
};
export type InviteFolderSettingModalV2UnsetMountPolicyMutation$variables = {
  input: UnsetVFolderMountPolicyInput;
  vfolderId: string;
};
export type InviteFolderSettingModalV2UnsetMountPolicyMutation$data = {
  readonly unsetVFolderMountPolicy: {
    readonly removed: boolean;
    readonly userId: string;
    readonly vfolderId: string;
  } | null | undefined;
};
export type InviteFolderSettingModalV2UnsetMountPolicyMutation = {
  response: InviteFolderSettingModalV2UnsetMountPolicyMutation$data;
  variables: InviteFolderSettingModalV2UnsetMountPolicyMutation$variables;
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
    "concreteType": "UnsetVFolderMountPolicyPayload",
    "kind": "LinkedField",
    "name": "unsetVFolderMountPolicy",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "vfolderId",
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
        "name": "removed",
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
    "name": "InviteFolderSettingModalV2UnsetMountPolicyMutation",
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
    "name": "InviteFolderSettingModalV2UnsetMountPolicyMutation",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "af9d17ce21363f1c2956576a4f37617a",
    "id": null,
    "metadata": {},
    "name": "InviteFolderSettingModalV2UnsetMountPolicyMutation",
    "operationKind": "mutation",
    "text": "mutation InviteFolderSettingModalV2UnsetMountPolicyMutation(\n  $vfolderId: UUID!\n  $input: UnsetVFolderMountPolicyInput!\n) {\n  unsetVFolderMountPolicy(vfolderId: $vfolderId, input: $input) {\n    vfolderId\n    userId\n    removed\n  }\n}\n"
  }
};
})();

(node as any).hash = "1474ad12138b3ca64126a521279b866e";

export default node;

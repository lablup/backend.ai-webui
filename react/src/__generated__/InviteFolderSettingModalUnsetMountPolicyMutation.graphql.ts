/**
 * @generated SignedSource<<704a7c58d42f93e9d8e9f15202434ad7>>
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
export type InviteFolderSettingModalUnsetMountPolicyMutation$variables = {
  input: UnsetVFolderMountPolicyInput;
  vfolderId: string;
};
export type InviteFolderSettingModalUnsetMountPolicyMutation$data = {
  readonly unsetVFolderMountPolicy: {
    readonly removed: boolean;
    readonly userId: string;
    readonly vfolderId: string;
  } | null | undefined;
};
export type InviteFolderSettingModalUnsetMountPolicyMutation = {
  response: InviteFolderSettingModalUnsetMountPolicyMutation$data;
  variables: InviteFolderSettingModalUnsetMountPolicyMutation$variables;
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
    "name": "InviteFolderSettingModalUnsetMountPolicyMutation",
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
    "name": "InviteFolderSettingModalUnsetMountPolicyMutation",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "2ca0c23a2b3ade9bef63a83ffa58955b",
    "id": null,
    "metadata": {},
    "name": "InviteFolderSettingModalUnsetMountPolicyMutation",
    "operationKind": "mutation",
    "text": "mutation InviteFolderSettingModalUnsetMountPolicyMutation(\n  $vfolderId: UUID!\n  $input: UnsetVFolderMountPolicyInput!\n) {\n  unsetVFolderMountPolicy(vfolderId: $vfolderId, input: $input) {\n    vfolderId\n    userId\n    removed\n  }\n}\n"
  }
};
})();

(node as any).hash = "400d965fbff9269751c0ba4ebcbf28bf";

export default node;

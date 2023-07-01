/**
 * @generated SignedSource<<eec1dbdd0e31e9927bc6e4e12958eaca>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type ModifyUserResourcePolicyInput = {
  max_vfolder_size: any;
};
export type ResourcePolicyCardModifyUserMutation$variables = {
  name: string;
  props: ModifyUserResourcePolicyInput;
};
export type ResourcePolicyCardModifyUserMutation$data = {
  readonly modify_user_resource_policy: {
    readonly msg: string | null;
    readonly ok: boolean | null;
  } | null;
};
export type ResourcePolicyCardModifyUserMutation = {
  response: ResourcePolicyCardModifyUserMutation$data;
  variables: ResourcePolicyCardModifyUserMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "name"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "props"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "name",
        "variableName": "name"
      },
      {
        "kind": "Variable",
        "name": "props",
        "variableName": "props"
      }
    ],
    "concreteType": "ModifyUserResourcePolicy",
    "kind": "LinkedField",
    "name": "modify_user_resource_policy",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "ok",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "msg",
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
    "name": "ResourcePolicyCardModifyUserMutation",
    "selections": (v1/*: any*/),
    "type": "Mutations",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ResourcePolicyCardModifyUserMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "9359c1f4ce56dfae06cb5dce603bd527",
    "id": null,
    "metadata": {},
    "name": "ResourcePolicyCardModifyUserMutation",
    "operationKind": "mutation",
    "text": "mutation ResourcePolicyCardModifyUserMutation(\n  $name: String!\n  $props: ModifyUserResourcePolicyInput!\n) {\n  modify_user_resource_policy(name: $name, props: $props) {\n    ok\n    msg\n  }\n}\n"
  }
};
})();

(node as any).hash = "0ec87fb70626f0880b7db7124a879bbd";

export default node;

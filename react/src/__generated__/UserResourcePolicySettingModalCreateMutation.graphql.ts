/**
 * @generated SignedSource<<5e90d5b429e58268493ce58fa40b7c81>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type CreateUserResourcePolicyInput = {
  max_customized_image_count?: number | null | undefined;
  max_quota_scope_size?: any | null | undefined;
  max_session_count_per_model_session?: number | null | undefined;
  max_vfolder_count?: number | null | undefined;
  max_vfolder_size?: any | null | undefined;
};
export type UserResourcePolicySettingModalCreateMutation$variables = {
  name: string;
  props: CreateUserResourcePolicyInput;
};
export type UserResourcePolicySettingModalCreateMutation$data = {
  readonly create_user_resource_policy: {
    readonly msg: string | null | undefined;
    readonly ok: boolean | null | undefined;
  } | null | undefined;
};
export type UserResourcePolicySettingModalCreateMutation = {
  response: UserResourcePolicySettingModalCreateMutation$data;
  variables: UserResourcePolicySettingModalCreateMutation$variables;
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
    "concreteType": "CreateUserResourcePolicy",
    "kind": "LinkedField",
    "name": "create_user_resource_policy",
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
    "name": "UserResourcePolicySettingModalCreateMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "UserResourcePolicySettingModalCreateMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "129c4a570d8ae1a075d9aa9261094c48",
    "id": null,
    "metadata": {},
    "name": "UserResourcePolicySettingModalCreateMutation",
    "operationKind": "mutation",
    "text": "mutation UserResourcePolicySettingModalCreateMutation(\n  $name: String!\n  $props: CreateUserResourcePolicyInput!\n) {\n  create_user_resource_policy(name: $name, props: $props) {\n    ok\n    msg\n  }\n}\n"
  }
};
})();

(node as any).hash = "9c00928ca86d4779838243df247257aa";

export default node;

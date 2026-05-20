/**
 * @generated SignedSource<<516cdfaea99cb07684f044e42d036873>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ModifyUserResourcePolicyInput = {
  max_customized_image_count?: number | null | undefined;
  max_quota_scope_size?: any | null | undefined;
  max_session_count_per_model_session?: number | null | undefined;
  max_vfolder_count?: number | null | undefined;
};
export type UserResourcePolicySettingModalModifyMutation$variables = {
  name: string;
  props: ModifyUserResourcePolicyInput;
};
export type UserResourcePolicySettingModalModifyMutation$data = {
  readonly modify_user_resource_policy: {
    readonly msg: string | null | undefined;
    readonly ok: boolean | null | undefined;
  } | null | undefined;
};
export type UserResourcePolicySettingModalModifyMutation = {
  response: UserResourcePolicySettingModalModifyMutation$data;
  variables: UserResourcePolicySettingModalModifyMutation$variables;
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
    "name": "UserResourcePolicySettingModalModifyMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "UserResourcePolicySettingModalModifyMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "f33ed379f4871e357183803b340a938a",
    "id": null,
    "metadata": {},
    "name": "UserResourcePolicySettingModalModifyMutation",
    "operationKind": "mutation",
    "text": "mutation UserResourcePolicySettingModalModifyMutation(\n  $name: String!\n  $props: ModifyUserResourcePolicyInput!\n) {\n  modify_user_resource_policy(name: $name, props: $props) {\n    ok\n    msg\n  }\n}\n"
  }
};
})();

(node as any).hash = "d50cbcfb63bfd30da81fea8968bb6436";

export default node;

/**
 * @generated SignedSource<<a1b15378714e12950a4b3f283d94b043>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ModifyScalingGroupInput = {
  description?: string | null | undefined;
  driver?: string | null | undefined;
  driver_opts?: string | null | undefined;
  is_active?: boolean | null | undefined;
  is_public?: boolean | null | undefined;
  scheduler?: string | null | undefined;
  scheduler_opts?: string | null | undefined;
  use_host_network?: boolean | null | undefined;
  wsproxy_addr?: string | null | undefined;
  wsproxy_api_token?: string | null | undefined;
};
export type ResourceGroupSettingModalUpdateMutation$variables = {
  input: ModifyScalingGroupInput;
  name: string;
};
export type ResourceGroupSettingModalUpdateMutation$data = {
  readonly modify_scaling_group: {
    readonly msg: string | null | undefined;
    readonly ok: boolean | null | undefined;
  } | null | undefined;
};
export type ResourceGroupSettingModalUpdateMutation = {
  response: ResourceGroupSettingModalUpdateMutation$data;
  variables: ResourceGroupSettingModalUpdateMutation$variables;
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
    "args": [
      {
        "kind": "Variable",
        "name": "name",
        "variableName": "name"
      },
      {
        "kind": "Variable",
        "name": "props",
        "variableName": "input"
      }
    ],
    "concreteType": "ModifyScalingGroup",
    "kind": "LinkedField",
    "name": "modify_scaling_group",
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
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "ResourceGroupSettingModalUpdateMutation",
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
    "name": "ResourceGroupSettingModalUpdateMutation",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "2352dc03b1acef2df9cf7c5f686665a3",
    "id": null,
    "metadata": {},
    "name": "ResourceGroupSettingModalUpdateMutation",
    "operationKind": "mutation",
    "text": "mutation ResourceGroupSettingModalUpdateMutation(\n  $name: String!\n  $input: ModifyScalingGroupInput!\n) {\n  modify_scaling_group(name: $name, props: $input) {\n    ok\n    msg\n  }\n}\n"
  }
};
})();

(node as any).hash = "510c22b428b17c9e16efd58a5f908c3d";

export default node;

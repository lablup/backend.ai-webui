/**
 * @generated SignedSource<<0f5483ae64b5020bfef3f29b675d0f26>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type CreateScalingGroupInput = {
  description?: string | null | undefined;
  driver: string;
  driver_opts?: string | null | undefined;
  is_active?: boolean | null | undefined;
  is_public?: boolean | null | undefined;
  scheduler: string;
  scheduler_opts?: string | null | undefined;
  use_host_network?: boolean | null | undefined;
  wsproxy_addr?: string | null | undefined;
  wsproxy_api_token?: string | null | undefined;
};
export type ResourceGroupSettingModalCreateMutation$variables = {
  input: CreateScalingGroupInput;
  name: string;
};
export type ResourceGroupSettingModalCreateMutation$data = {
  readonly create_scaling_group: {
    readonly msg: string | null | undefined;
    readonly ok: boolean | null | undefined;
  } | null | undefined;
};
export type ResourceGroupSettingModalCreateMutation = {
  response: ResourceGroupSettingModalCreateMutation$data;
  variables: ResourceGroupSettingModalCreateMutation$variables;
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
    "concreteType": "CreateScalingGroup",
    "kind": "LinkedField",
    "name": "create_scaling_group",
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
    "name": "ResourceGroupSettingModalCreateMutation",
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
    "name": "ResourceGroupSettingModalCreateMutation",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "6d6716d2dedf664e623006a2315b3c66",
    "id": null,
    "metadata": {},
    "name": "ResourceGroupSettingModalCreateMutation",
    "operationKind": "mutation",
    "text": "mutation ResourceGroupSettingModalCreateMutation(\n  $name: String!\n  $input: CreateScalingGroupInput!\n) {\n  create_scaling_group(name: $name, props: $input) {\n    ok\n    msg\n  }\n}\n"
  }
};
})();

(node as any).hash = "8642e40e794eaf1f4b0a84e05104d75c";

export default node;

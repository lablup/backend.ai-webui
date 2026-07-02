/**
 * @generated SignedSource<<4f7e5919a441b2af68c91d3f83f915ac>>
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
export type ResourceGroupSettingModalLegacyCreateMutation$variables = {
  input: CreateScalingGroupInput;
  name: string;
};
export type ResourceGroupSettingModalLegacyCreateMutation$data = {
  readonly create_scaling_group: {
    readonly msg: string | null | undefined;
    readonly ok: boolean | null | undefined;
  } | null | undefined;
};
export type ResourceGroupSettingModalLegacyCreateMutation = {
  response: ResourceGroupSettingModalLegacyCreateMutation$data;
  variables: ResourceGroupSettingModalLegacyCreateMutation$variables;
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
    "name": "ResourceGroupSettingModalLegacyCreateMutation",
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
    "name": "ResourceGroupSettingModalLegacyCreateMutation",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "3dae9ff6be2c668c721fbda05b8b9c4b",
    "id": null,
    "metadata": {},
    "name": "ResourceGroupSettingModalLegacyCreateMutation",
    "operationKind": "mutation",
    "text": "mutation ResourceGroupSettingModalLegacyCreateMutation(\n  $name: String!\n  $input: CreateScalingGroupInput!\n) {\n  create_scaling_group(name: $name, props: $input) {\n    ok\n    msg\n  }\n}\n"
  }
};
})();

(node as any).hash = "bc1aaeac33d28226ab7fc021d66eb360";

export default node;

/**
 * @generated SignedSource<<cf553751d82dafbd3839b8736fd0b6b5>>
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
export type ResourceGroupSettingModalLegacyModifyMutation$variables = {
  input: ModifyScalingGroupInput;
  name: string;
};
export type ResourceGroupSettingModalLegacyModifyMutation$data = {
  readonly modify_scaling_group: {
    readonly msg: string | null | undefined;
    readonly ok: boolean | null | undefined;
  } | null | undefined;
};
export type ResourceGroupSettingModalLegacyModifyMutation = {
  response: ResourceGroupSettingModalLegacyModifyMutation$data;
  variables: ResourceGroupSettingModalLegacyModifyMutation$variables;
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
    "name": "ResourceGroupSettingModalLegacyModifyMutation",
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
    "name": "ResourceGroupSettingModalLegacyModifyMutation",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "dbd797bca3121138258bbe9495e4c10c",
    "id": null,
    "metadata": {},
    "name": "ResourceGroupSettingModalLegacyModifyMutation",
    "operationKind": "mutation",
    "text": "mutation ResourceGroupSettingModalLegacyModifyMutation(\n  $name: String!\n  $input: ModifyScalingGroupInput!\n) {\n  modify_scaling_group(name: $name, props: $input) {\n    ok\n    msg\n  }\n}\n"
  }
};
})();

(node as any).hash = "5b812b6f8907bc4131f55b8098277952";

export default node;

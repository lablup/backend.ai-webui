/**
 * @generated SignedSource<<716b22cd9866fc0d7e0a57b26f09a06d>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type CreateResourcePresetInput = {
  resource_slots: string;
  scaling_group_name?: string | null | undefined;
  shared_memory?: string | null | undefined;
};
export type ResourcePresetSettingModalCreateMutation$variables = {
  name: string;
  props: CreateResourcePresetInput;
};
export type ResourcePresetSettingModalCreateMutation$data = {
  readonly create_resource_preset: {
    readonly msg: string | null | undefined;
    readonly ok: boolean | null | undefined;
  } | null | undefined;
};
export type ResourcePresetSettingModalCreateMutation = {
  response: ResourcePresetSettingModalCreateMutation$data;
  variables: ResourcePresetSettingModalCreateMutation$variables;
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
    "concreteType": "CreateResourcePreset",
    "kind": "LinkedField",
    "name": "create_resource_preset",
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
    "name": "ResourcePresetSettingModalCreateMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ResourcePresetSettingModalCreateMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "4c6d8ef938cb69d5336e86c9d7fca415",
    "id": null,
    "metadata": {},
    "name": "ResourcePresetSettingModalCreateMutation",
    "operationKind": "mutation",
    "text": "mutation ResourcePresetSettingModalCreateMutation(\n  $name: String!\n  $props: CreateResourcePresetInput!\n) {\n  create_resource_preset(name: $name, props: $props) {\n    ok\n    msg\n  }\n}\n"
  }
};
})();

(node as any).hash = "6d3e941d6668ba2fda013fa61adb004d";

export default node;

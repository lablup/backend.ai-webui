/**
 * @generated SignedSource<<8ba382e8720205d5b690b7bbe1f56a80>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ModifyResourcePresetInput = {
  name?: string | null | undefined;
  resource_slots?: string | null | undefined;
  scaling_group_name?: string | null | undefined;
  shared_memory?: string | null | undefined;
};
export type ResourcePresetSettingModalModifyMutation$variables = {
  id: string;
  props: ModifyResourcePresetInput;
};
export type ResourcePresetSettingModalModifyMutation$data = {
  readonly modify_resource_preset: {
    readonly msg: string | null | undefined;
    readonly ok: boolean | null | undefined;
  } | null | undefined;
};
export type ResourcePresetSettingModalModifyMutation = {
  response: ResourcePresetSettingModalModifyMutation$data;
  variables: ResourcePresetSettingModalModifyMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
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
        "name": "id",
        "variableName": "id"
      },
      {
        "kind": "Variable",
        "name": "props",
        "variableName": "props"
      }
    ],
    "concreteType": "ModifyResourcePreset",
    "kind": "LinkedField",
    "name": "modify_resource_preset",
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
    "name": "ResourcePresetSettingModalModifyMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ResourcePresetSettingModalModifyMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "9c4a2ac9b1340b3e38cb8f8c3556cd68",
    "id": null,
    "metadata": {},
    "name": "ResourcePresetSettingModalModifyMutation",
    "operationKind": "mutation",
    "text": "mutation ResourcePresetSettingModalModifyMutation(\n  $id: UUID!\n  $props: ModifyResourcePresetInput!\n) {\n  modify_resource_preset(id: $id, props: $props) {\n    ok\n    msg\n  }\n}\n"
  }
};
})();

(node as any).hash = "3ce874f63fb773223209660604f18b81";

export default node;

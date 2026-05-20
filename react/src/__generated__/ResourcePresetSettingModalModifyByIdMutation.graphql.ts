/**
 * @generated SignedSource<<28901fcbf617b15ace654f8fc0d39ac4>>
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
export type ResourcePresetSettingModalModifyByIdMutation$variables = {
  id: string;
  props: ModifyResourcePresetInput;
};
export type ResourcePresetSettingModalModifyByIdMutation$data = {
  readonly modify_resource_preset: {
    readonly msg: string | null | undefined;
    readonly ok: boolean | null | undefined;
  } | null | undefined;
};
export type ResourcePresetSettingModalModifyByIdMutation = {
  response: ResourcePresetSettingModalModifyByIdMutation$data;
  variables: ResourcePresetSettingModalModifyByIdMutation$variables;
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
    "name": "ResourcePresetSettingModalModifyByIdMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ResourcePresetSettingModalModifyByIdMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "a9e04a9d13321e5f45297f1b8b657c7f",
    "id": null,
    "metadata": {},
    "name": "ResourcePresetSettingModalModifyByIdMutation",
    "operationKind": "mutation",
    "text": "mutation ResourcePresetSettingModalModifyByIdMutation(\n  $id: UUID!\n  $props: ModifyResourcePresetInput!\n) {\n  modify_resource_preset(id: $id, props: $props) {\n    ok\n    msg\n  }\n}\n"
  }
};
})();

(node as any).hash = "ea2ed67aec94a7a731f279a6c539a21a";

export default node;

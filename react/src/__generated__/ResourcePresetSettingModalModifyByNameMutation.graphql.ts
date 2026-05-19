/**
 * @generated SignedSource<<e6e3114bad043dbf38cfce8b3bd93545>>
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
export type ResourcePresetSettingModalModifyByNameMutation$variables = {
  name: string;
  props: ModifyResourcePresetInput;
};
export type ResourcePresetSettingModalModifyByNameMutation$data = {
  readonly modify_resource_preset: {
    readonly msg: string | null | undefined;
    readonly ok: boolean | null | undefined;
  } | null | undefined;
};
export type ResourcePresetSettingModalModifyByNameMutation = {
  response: ResourcePresetSettingModalModifyByNameMutation$data;
  variables: ResourcePresetSettingModalModifyByNameMutation$variables;
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
    "name": "ResourcePresetSettingModalModifyByNameMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ResourcePresetSettingModalModifyByNameMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "6ce07dbffc5597af1943b0840e1b3810",
    "id": null,
    "metadata": {},
    "name": "ResourcePresetSettingModalModifyByNameMutation",
    "operationKind": "mutation",
    "text": "mutation ResourcePresetSettingModalModifyByNameMutation(\n  $name: String!\n  $props: ModifyResourcePresetInput!\n) {\n  modify_resource_preset(name: $name, props: $props) {\n    ok\n    msg\n  }\n}\n"
  }
};
})();

(node as any).hash = "a3d038466cde4ef350d21929ee0513b1";

export default node;

/**
 * @generated SignedSource<<6dae1685a0d37836ce882e215f330e60>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type PresetTarget = "ARGS" | "ENV" | "%future added value";
export type PresetValueType = "BOOL" | "FLAG" | "FLOAT" | "INT" | "STR" | "%future added value";
export type CreateRuntimeVariantPresetInput = {
  defaultValue?: string | null | undefined;
  description?: string | null | undefined;
  key: string;
  name: string;
  presetTarget: PresetTarget;
  required?: boolean;
  runtimeVariantId: string;
  valueType: PresetValueType;
};
export type BAIRuntimeVariantPresetSettingModalCreateMutation$variables = {
  input: CreateRuntimeVariantPresetInput;
};
export type BAIRuntimeVariantPresetSettingModalCreateMutation$data = {
  readonly adminCreateRuntimeVariantPreset: {
    readonly preset: {
      readonly createdAt: string;
      readonly description: string | null | undefined;
      readonly id: string;
      readonly name: string;
      readonly rank: number;
      readonly required: boolean;
      readonly runtimeVariantId: string;
      readonly targetSpec: {
        readonly defaultValue: string | null | undefined;
        readonly key: string;
        readonly presetTarget: PresetTarget;
        readonly valueType: PresetValueType;
      };
      readonly updatedAt: string | null | undefined;
    };
  } | null | undefined;
};
export type BAIRuntimeVariantPresetSettingModalCreateMutation = {
  response: BAIRuntimeVariantPresetSettingModalCreateMutation$data;
  variables: BAIRuntimeVariantPresetSettingModalCreateMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "CreateRuntimeVariantPresetPayload",
    "kind": "LinkedField",
    "name": "adminCreateRuntimeVariantPreset",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "RuntimeVariantPreset",
        "kind": "LinkedField",
        "name": "preset",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "runtimeVariantId",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "name",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "description",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "rank",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "PresetTargetSpec",
            "kind": "LinkedField",
            "name": "targetSpec",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "presetTarget",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "valueType",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "defaultValue",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "key",
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "required",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "createdAt",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "updatedAt",
            "storageKey": null
          }
        ],
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
    "name": "BAIRuntimeVariantPresetSettingModalCreateMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "BAIRuntimeVariantPresetSettingModalCreateMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "f03c8db95236bbd22f8c1499e1aba2eb",
    "id": null,
    "metadata": {},
    "name": "BAIRuntimeVariantPresetSettingModalCreateMutation",
    "operationKind": "mutation",
    "text": "mutation BAIRuntimeVariantPresetSettingModalCreateMutation(\n  $input: CreateRuntimeVariantPresetInput!\n) {\n  adminCreateRuntimeVariantPreset(input: $input) {\n    preset {\n      id\n      runtimeVariantId\n      name\n      description\n      rank\n      targetSpec {\n        presetTarget\n        valueType\n        defaultValue\n        key\n      }\n      required @since(version: \"26.4.4\")\n      createdAt\n      updatedAt\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "ebd23dd2f40882d7551e5afe322225b8";

export default node;

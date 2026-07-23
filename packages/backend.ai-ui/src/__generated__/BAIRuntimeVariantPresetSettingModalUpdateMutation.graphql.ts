/**
 * @generated SignedSource<<654b10abc304e961b6386e165db508cd>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type PresetTarget = "ARGS" | "ENV" | "%future added value";
export type PresetValueType = "BOOL" | "FLAG" | "FLOAT" | "INT" | "STR" | "%future added value";
export type UpdateRuntimeVariantPresetInput = {
  defaultValue?: string | null | undefined;
  description?: string | null | undefined;
  id: string;
  key?: string | null | undefined;
  name?: string | null | undefined;
  presetTarget?: PresetTarget | null | undefined;
  rank?: number | null | undefined;
  required?: boolean | null | undefined;
  valueType?: PresetValueType | null | undefined;
};
export type BAIRuntimeVariantPresetSettingModalUpdateMutation$variables = {
  input: UpdateRuntimeVariantPresetInput;
};
export type BAIRuntimeVariantPresetSettingModalUpdateMutation$data = {
  readonly adminUpdateRuntimeVariantPreset: {
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
export type BAIRuntimeVariantPresetSettingModalUpdateMutation = {
  response: BAIRuntimeVariantPresetSettingModalUpdateMutation$data;
  variables: BAIRuntimeVariantPresetSettingModalUpdateMutation$variables;
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
    "concreteType": "UpdateRuntimeVariantPresetPayload",
    "kind": "LinkedField",
    "name": "adminUpdateRuntimeVariantPreset",
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
    "name": "BAIRuntimeVariantPresetSettingModalUpdateMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "BAIRuntimeVariantPresetSettingModalUpdateMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "daf60a4649ec7d3b976856bf5e8643b7",
    "id": null,
    "metadata": {},
    "name": "BAIRuntimeVariantPresetSettingModalUpdateMutation",
    "operationKind": "mutation",
    "text": "mutation BAIRuntimeVariantPresetSettingModalUpdateMutation(\n  $input: UpdateRuntimeVariantPresetInput!\n) {\n  adminUpdateRuntimeVariantPreset(input: $input) {\n    preset {\n      id\n      runtimeVariantId\n      name\n      description\n      rank\n      targetSpec {\n        presetTarget\n        valueType\n        defaultValue\n        key\n      }\n      required @since(version: \"26.4.4\")\n      createdAt\n      updatedAt\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "bac8095110eb8ab689dd1a6422f3a834";

export default node;

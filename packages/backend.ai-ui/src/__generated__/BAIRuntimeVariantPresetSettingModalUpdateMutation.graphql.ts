/**
 * @generated SignedSource<<452a985bfeea7795a99cbca793bd57aa>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type PresetTarget = "ARGS" | "ENV" | "%future added value";
export type PresetValueType = "BOOL" | "FLAG" | "FLOAT" | "INT" | "STR" | "%future added value";
export type RuntimeVariantPresetUIType = "CHECKBOX" | "NUMBER_INPUT" | "SELECT" | "SLIDER" | "TEXT_INPUT" | "%future added value";
export type UpdateRuntimeVariantPresetInput = {
  category?: string | null | undefined;
  defaultValue?: string | null | undefined;
  description?: string | null | undefined;
  displayName?: string | null | undefined;
  id: string;
  key?: string | null | undefined;
  name?: string | null | undefined;
  presetTarget?: PresetTarget | null | undefined;
  rank?: number | null | undefined;
  required?: boolean | null | undefined;
  uiOption?: RuntimeVariantPresetUIOptionInput | null | undefined;
  valueType?: PresetValueType | null | undefined;
};
export type RuntimeVariantPresetUIOptionInput = {
  choices?: RuntimeVariantPresetChoiceOptionInput | null | undefined;
  number?: RuntimeVariantPresetNumberOptionInput | null | undefined;
  slider?: RuntimeVariantPresetSliderOptionInput | null | undefined;
  text?: RuntimeVariantPresetTextOptionInput | null | undefined;
  uiType: RuntimeVariantPresetUIType;
};
export type RuntimeVariantPresetSliderOptionInput = {
  max: number;
  min: number;
  step?: number;
};
export type RuntimeVariantPresetNumberOptionInput = {
  max?: number | null | undefined;
  min?: number | null | undefined;
};
export type RuntimeVariantPresetChoiceOptionInput = {
  items: ReadonlyArray<RuntimeVariantPresetChoiceItemInput>;
};
export type RuntimeVariantPresetChoiceItemInput = {
  label: string;
  value: string;
};
export type RuntimeVariantPresetTextOptionInput = {
  placeholder?: string | null | undefined;
};
export type BAIRuntimeVariantPresetSettingModalUpdateMutation$variables = {
  input: UpdateRuntimeVariantPresetInput;
};
export type BAIRuntimeVariantPresetSettingModalUpdateMutation$data = {
  readonly adminUpdateRuntimeVariantPreset: {
    readonly preset: {
      readonly category: string | null | undefined;
      readonly createdAt: string;
      readonly description: string | null | undefined;
      readonly displayName: string | null | undefined;
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
      readonly uiOption: {
        readonly choices: {
          readonly items: ReadonlyArray<{
            readonly label: string;
            readonly value: string;
          }>;
        } | null | undefined;
        readonly number: {
          readonly max: number | null | undefined;
          readonly min: number | null | undefined;
        } | null | undefined;
        readonly slider: {
          readonly max: number;
          readonly min: number;
          readonly step: number;
        } | null | undefined;
        readonly text: {
          readonly placeholder: string | null | undefined;
        } | null | undefined;
        readonly uiType: string;
      } | null | undefined;
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
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "min",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "max",
  "storageKey": null
},
v3 = [
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
            "name": "category",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "displayName",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "UIOption",
            "kind": "LinkedField",
            "name": "uiOption",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "uiType",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "SliderOption",
                "kind": "LinkedField",
                "name": "slider",
                "plural": false,
                "selections": [
                  (v1/*: any*/),
                  (v2/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "step",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "NumberOption",
                "kind": "LinkedField",
                "name": "number",
                "plural": false,
                "selections": [
                  (v1/*: any*/),
                  (v2/*: any*/)
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "ChoiceOption",
                "kind": "LinkedField",
                "name": "choices",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "ChoiceItem",
                    "kind": "LinkedField",
                    "name": "items",
                    "plural": true,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "value",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "label",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "TextOption",
                "kind": "LinkedField",
                "name": "text",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "placeholder",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
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
    "selections": (v3/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "BAIRuntimeVariantPresetSettingModalUpdateMutation",
    "selections": (v3/*: any*/)
  },
  "params": {
    "cacheID": "ec39a90730c3396ada97c5b9a8532912",
    "id": null,
    "metadata": {},
    "name": "BAIRuntimeVariantPresetSettingModalUpdateMutation",
    "operationKind": "mutation",
    "text": "mutation BAIRuntimeVariantPresetSettingModalUpdateMutation(\n  $input: UpdateRuntimeVariantPresetInput!\n) {\n  adminUpdateRuntimeVariantPreset(input: $input) {\n    preset {\n      id\n      runtimeVariantId\n      name\n      description\n      rank\n      targetSpec {\n        presetTarget\n        valueType\n        defaultValue\n        key\n      }\n      required @since(version: \"26.4.4\")\n      category\n      displayName\n      uiOption {\n        uiType\n        slider {\n          min\n          max\n          step\n        }\n        number {\n          min\n          max\n        }\n        choices {\n          items {\n            value\n            label\n          }\n        }\n        text {\n          placeholder\n        }\n      }\n      createdAt\n      updatedAt\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "990528f6fc88a85e70a3d4db39fb7316";

export default node;

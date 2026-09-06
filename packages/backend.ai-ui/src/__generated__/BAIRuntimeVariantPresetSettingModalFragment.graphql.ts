/**
 * @generated SignedSource<<45a719d1329a3a401dcf0fbc6ee20d0f>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type PresetTarget = "ARGS" | "ENV" | "%future added value";
export type PresetValueType = "BOOL" | "FLAG" | "FLOAT" | "INT" | "STR" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type BAIRuntimeVariantPresetSettingModalFragment$data = {
  readonly category: string | null | undefined;
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
  readonly " $fragmentType": "BAIRuntimeVariantPresetSettingModalFragment";
};
export type BAIRuntimeVariantPresetSettingModalFragment$key = {
  readonly " $data"?: BAIRuntimeVariantPresetSettingModalFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"BAIRuntimeVariantPresetSettingModalFragment">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "min",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "max",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "BAIRuntimeVariantPresetSettingModalFragment",
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
            (v0/*: any*/),
            (v1/*: any*/),
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
            (v0/*: any*/),
            (v1/*: any*/)
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
    }
  ],
  "type": "RuntimeVariantPreset",
  "abstractKey": null
};
})();

(node as any).hash = "78eb89068b7e6445d84ece9834aefce9";

export default node;

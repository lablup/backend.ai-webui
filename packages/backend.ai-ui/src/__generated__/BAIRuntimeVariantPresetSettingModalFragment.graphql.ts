/**
 * @generated SignedSource<<8cd5c3b5ef62b83c2b496a712666f9f9>>
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
  readonly " $fragmentType": "BAIRuntimeVariantPresetSettingModalFragment";
};
export type BAIRuntimeVariantPresetSettingModalFragment$key = {
  readonly " $data"?: BAIRuntimeVariantPresetSettingModalFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"BAIRuntimeVariantPresetSettingModalFragment">;
};

const node: ReaderFragment = {
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
    }
  ],
  "type": "RuntimeVariantPreset",
  "abstractKey": null
};

(node as any).hash = "806440db95e40aadbaf9ef49236f3ecb";

export default node;

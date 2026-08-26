/**
 * @generated SignedSource<<dc6fdc72d4f30986c4fa89e204bf8c49>>
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
export type BAIRuntimeVariantPresetTableFragment$data = ReadonlyArray<{
  readonly category: string | null | undefined;
  readonly createdAt: string;
  readonly description: string | null | undefined;
  readonly displayName: string | null | undefined;
  readonly id: string;
  readonly name: string;
  readonly rank: number;
  readonly required: boolean;
  readonly runtimeVariant: {
    readonly name: string;
  } | null | undefined;
  readonly runtimeVariantId: string;
  readonly targetSpec: {
    readonly defaultValue: string | null | undefined;
    readonly key: string;
    readonly presetTarget: PresetTarget;
    readonly valueType: PresetValueType;
  };
  readonly uiOption: {
    readonly uiType: string;
  } | null | undefined;
  readonly updatedAt: string | null | undefined;
  readonly " $fragmentType": "BAIRuntimeVariantPresetTableFragment";
} | null | undefined>;
export type BAIRuntimeVariantPresetTableFragment$key = ReadonlyArray<{
  readonly " $data"?: BAIRuntimeVariantPresetTableFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"BAIRuntimeVariantPresetTableFragment">;
}>;

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "BAIRuntimeVariantPresetTableFragment",
  "selections": [
    {
      "kind": "RequiredField",
      "field": {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "id",
        "storageKey": null
      },
      "action": "NONE"
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
      "concreteType": "RuntimeVariant",
      "kind": "LinkedField",
      "name": "runtimeVariant",
      "plural": false,
      "selections": [
        (v0/*: any*/)
      ],
      "storageKey": null
    },
    {
      "kind": "RequiredField",
      "field": (v0/*: any*/),
      "action": "NONE"
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
  "type": "RuntimeVariantPreset",
  "abstractKey": null
};
})();

(node as any).hash = "fc05bd03d297952139d05fd622d40768";

export default node;

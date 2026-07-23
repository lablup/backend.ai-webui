/**
 * @generated SignedSource<<52f9aff1aeebd2caa6296ce6db3e92f5>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type PrometheusQueryPresetEditorModalFragment$data = {
  readonly categoryId: string | null | undefined;
  readonly description: string | null | undefined;
  readonly id: string;
  readonly metricName: string;
  readonly name: string;
  readonly options: {
    readonly filterLabels: ReadonlyArray<string>;
    readonly groupLabels: ReadonlyArray<string>;
  };
  readonly queryTemplate: string;
  readonly timeWindow: string | null | undefined;
  readonly " $fragmentType": "PrometheusQueryPresetEditorModalFragment";
};
export type PrometheusQueryPresetEditorModalFragment$key = {
  readonly " $data"?: PrometheusQueryPresetEditorModalFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"PrometheusQueryPresetEditorModalFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "PrometheusQueryPresetEditorModalFragment",
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
      "name": "categoryId",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "metricName",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "queryTemplate",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "timeWindow",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "QueryDefinitionOptions",
      "kind": "LinkedField",
      "name": "options",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "filterLabels",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "groupLabels",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "QueryDefinition",
  "abstractKey": null
};

(node as any).hash = "6d11a2cb2617e7e07936d5e1245bb36d";

export default node;

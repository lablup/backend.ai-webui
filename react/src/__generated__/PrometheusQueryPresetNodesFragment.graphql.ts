/**
 * @generated SignedSource<<d2f56a439e57ee8869789ab739f9fbbb>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type PrometheusQueryPresetNodesFragment$data = ReadonlyArray<{
  readonly category: {
    readonly id: string;
    readonly name: string;
  } | null | undefined;
  readonly categoryId: string | null | undefined;
  readonly createdAt: string;
  readonly description: string | null | undefined;
  readonly id: string;
  readonly metricName: string;
  readonly name: string;
  readonly options: {
    readonly filterLabels: ReadonlyArray<string>;
    readonly groupLabels: ReadonlyArray<string>;
  };
  readonly queryTemplate: string;
  readonly rank: number;
  readonly timeWindow: string | null | undefined;
  readonly updatedAt: string;
  readonly " $fragmentSpreads": FragmentRefs<"PrometheusQueryPresetEditorModalFragment">;
  readonly " $fragmentType": "PrometheusQueryPresetNodesFragment";
}>;
export type PrometheusQueryPresetNodesFragment$key = ReadonlyArray<{
  readonly " $data"?: PrometheusQueryPresetNodesFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"PrometheusQueryPresetNodesFragment">;
}>;

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v1 = {
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
  "name": "PrometheusQueryPresetNodesFragment",
  "selections": [
    (v0/*: any*/),
    (v1/*: any*/),
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
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "QueryPresetCategory",
      "kind": "LinkedField",
      "name": "category",
      "plural": false,
      "selections": [
        (v0/*: any*/),
        (v1/*: any*/)
      ],
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "PrometheusQueryPresetEditorModalFragment"
    }
  ],
  "type": "QueryDefinition",
  "abstractKey": null
};
})();

(node as any).hash = "455118fe7944c6138727a6f6acfd47cb";

export default node;

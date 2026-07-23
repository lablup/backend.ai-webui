/**
 * @generated SignedSource<<f8f5012872e11a622e00eee300c26011>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type PrometheusQueryPresetEditorModalCategoriesQuery$variables = Record<PropertyKey, never>;
export type PrometheusQueryPresetEditorModalCategoriesQuery$data = {
  readonly prometheusQueryPresetCategories: ReadonlyArray<{
    readonly id: string;
    readonly name: string;
  }> | null | undefined;
};
export type PrometheusQueryPresetEditorModalCategoriesQuery = {
  response: PrometheusQueryPresetEditorModalCategoriesQuery$data;
  variables: PrometheusQueryPresetEditorModalCategoriesQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "QueryPresetCategory",
    "kind": "LinkedField",
    "name": "prometheusQueryPresetCategories",
    "plural": true,
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
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "PrometheusQueryPresetEditorModalCategoriesQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "PrometheusQueryPresetEditorModalCategoriesQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "c28830526d915797ea01849675c06f38",
    "id": null,
    "metadata": {},
    "name": "PrometheusQueryPresetEditorModalCategoriesQuery",
    "operationKind": "query",
    "text": "query PrometheusQueryPresetEditorModalCategoriesQuery {\n  prometheusQueryPresetCategories {\n    id\n    name\n  }\n}\n"
  }
};
})();

(node as any).hash = "06a58c02ded799e824d13c84845ee7f2";

export default node;

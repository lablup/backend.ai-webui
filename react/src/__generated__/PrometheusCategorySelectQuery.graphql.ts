/**
 * @generated SignedSource<<f8c4a92f4c53fefe3a60aefecff6ee25>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type PrometheusCategorySelectQuery$variables = Record<PropertyKey, never>;
export type PrometheusCategorySelectQuery$data = {
  readonly prometheusQueryPresetCategories: ReadonlyArray<{
    readonly id: string;
    readonly name: string;
  }> | null | undefined;
};
export type PrometheusCategorySelectQuery = {
  response: PrometheusCategorySelectQuery$data;
  variables: PrometheusCategorySelectQuery$variables;
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
    "name": "PrometheusCategorySelectQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "PrometheusCategorySelectQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "e817765b1c8f0f8bdcd0bc42497d8b22",
    "id": null,
    "metadata": {},
    "name": "PrometheusCategorySelectQuery",
    "operationKind": "query",
    "text": "query PrometheusCategorySelectQuery {\n  prometheusQueryPresetCategories {\n    id\n    name\n  }\n}\n"
  }
};
})();

(node as any).hash = "22d271feb4bf2c935814101761d7b03e";

export default node;

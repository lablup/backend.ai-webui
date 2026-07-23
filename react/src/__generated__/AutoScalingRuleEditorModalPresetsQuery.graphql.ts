/**
 * @generated SignedSource<<886d1d670b3953cd558d0ee663cd9966>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type AutoScalingRuleEditorModalPresetsQuery$variables = Record<PropertyKey, never>;
export type AutoScalingRuleEditorModalPresetsQuery$data = {
  readonly prometheusQueryPresets: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly category: {
          readonly id: string;
          readonly name: string;
        } | null | undefined;
        readonly categoryId: string | null | undefined;
        readonly description: string | null | undefined;
        readonly id: string;
        readonly metricName: string;
        readonly name: string;
        readonly queryTemplate: string;
        readonly rank: number;
        readonly timeWindow: string | null | undefined;
      };
    }>;
  } | null | undefined;
};
export type AutoScalingRuleEditorModalPresetsQuery = {
  response: AutoScalingRuleEditorModalPresetsQuery$data;
  variables: AutoScalingRuleEditorModalPresetsQuery$variables;
};

const node: ConcreteRequest = (function(){
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
},
v2 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "QueryDefinitionConnection",
    "kind": "LinkedField",
    "name": "prometheusQueryPresets",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "QueryDefinitionEdge",
        "kind": "LinkedField",
        "name": "edges",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "QueryDefinition",
            "kind": "LinkedField",
            "name": "node",
            "plural": false,
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
                "concreteType": "QueryPresetCategory",
                "kind": "LinkedField",
                "name": "category",
                "plural": false,
                "selections": [
                  (v0/*: any*/),
                  (v1/*: any*/)
                ],
                "storageKey": null
              }
            ],
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
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "AutoScalingRuleEditorModalPresetsQuery",
    "selections": (v2/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "AutoScalingRuleEditorModalPresetsQuery",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "04d06fec5284e709aaee3606d8a4bb53",
    "id": null,
    "metadata": {},
    "name": "AutoScalingRuleEditorModalPresetsQuery",
    "operationKind": "query",
    "text": "query AutoScalingRuleEditorModalPresetsQuery {\n  prometheusQueryPresets {\n    edges {\n      node {\n        id\n        name\n        description\n        rank\n        categoryId\n        metricName\n        queryTemplate\n        timeWindow\n        category @since(version: \"26.4.3\") {\n          id\n          name\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "6582d4cf067148f5b39755e919c0f4f2";

export default node;

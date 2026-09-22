/**
 * @generated SignedSource<<3a2d8877e479611c352c21c02c3e5bbc>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type AutoScalingRuleEditorModalPresetsQuery$variables = {
  limit: number;
};
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
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "limit"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v3 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "limit",
        "variableName": "limit"
      }
    ],
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
              (v1/*: any*/),
              (v2/*: any*/),
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
                  (v1/*: any*/),
                  (v2/*: any*/)
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "AutoScalingRuleEditorModalPresetsQuery",
    "selections": (v3/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "AutoScalingRuleEditorModalPresetsQuery",
    "selections": (v3/*: any*/)
  },
  "params": {
    "cacheID": "6d311f0545011ee1c6a5ab3cac1f1939",
    "id": null,
    "metadata": {},
    "name": "AutoScalingRuleEditorModalPresetsQuery",
    "operationKind": "query",
    "text": "query AutoScalingRuleEditorModalPresetsQuery(\n  $limit: Int!\n) {\n  prometheusQueryPresets(limit: $limit) {\n    edges {\n      node {\n        id\n        name\n        description\n        rank\n        categoryId\n        metricName\n        queryTemplate\n        timeWindow\n        category @since(version: \"26.4.3\") {\n          id\n          name\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "7d9cdf46714c6881f9b7b0a851b37c93";

export default node;

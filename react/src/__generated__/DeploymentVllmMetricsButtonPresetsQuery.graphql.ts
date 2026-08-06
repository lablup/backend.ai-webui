/**
 * @generated SignedSource<<bbab638ab39a713be0f2dd2f5e85351b>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type DeploymentVllmMetricsButtonPresetsQuery$variables = Record<PropertyKey, never>;
export type DeploymentVllmMetricsButtonPresetsQuery$data = {
  readonly prometheusQueryPresets: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly category: {
          readonly name: string;
        } | null | undefined;
        readonly id: string;
        readonly metricName: string;
        readonly name: string;
        readonly rank: number;
      };
    }>;
  } | null | undefined;
};
export type DeploymentVllmMetricsButtonPresetsQuery = {
  response: DeploymentVllmMetricsButtonPresetsQuery$data;
  variables: DeploymentVllmMetricsButtonPresetsQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Literal",
        "name": "limit",
        "value": 100
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
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "id",
                "storageKey": null
              },
              (v0/*: any*/),
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
                "name": "rank",
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
                  (v0/*: any*/)
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
    "storageKey": "prometheusQueryPresets(limit:100)"
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "DeploymentVllmMetricsButtonPresetsQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "DeploymentVllmMetricsButtonPresetsQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "0c316e2fd8c06068f8aba1442149bfbf",
    "id": null,
    "metadata": {},
    "name": "DeploymentVllmMetricsButtonPresetsQuery",
    "operationKind": "query",
    "text": "query DeploymentVllmMetricsButtonPresetsQuery {\n  prometheusQueryPresets(limit: 100) {\n    edges {\n      node {\n        id\n        name\n        metricName\n        rank\n        category @since(version: \"26.4.3\") {\n          name\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "3622c8b4a616de011eb5c831bf6983c8";

export default node;

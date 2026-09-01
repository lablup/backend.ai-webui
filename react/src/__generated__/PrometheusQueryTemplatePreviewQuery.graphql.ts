/**
 * @generated SignedSource<<eb14020a78a1d657160d03408a3d77d0>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type PrometheusQueryTemplatePreviewQuery$variables = {
  queryTemplate: string;
};
export type PrometheusQueryTemplatePreviewQuery$data = {
  readonly adminPreviewPrometheusQueryPreset: {
    readonly result: ReadonlyArray<{
      readonly values: ReadonlyArray<{
        readonly timestamp: number;
        readonly value: string;
      }>;
    }>;
    readonly status: string;
  } | null | undefined;
};
export type PrometheusQueryTemplatePreviewQuery = {
  response: PrometheusQueryTemplatePreviewQuery$data;
  variables: PrometheusQueryTemplatePreviewQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "queryTemplate"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "fields": [
          {
            "kind": "Variable",
            "name": "queryTemplate",
            "variableName": "queryTemplate"
          }
        ],
        "kind": "ObjectValue",
        "name": "input"
      }
    ],
    "concreteType": "QueryDefinitionExecuteResult",
    "kind": "LinkedField",
    "name": "adminPreviewPrometheusQueryPreset",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "status",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "QueryDefinitionMetricResult",
        "kind": "LinkedField",
        "name": "result",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "QueryDefinitionMetricResultValue",
            "kind": "LinkedField",
            "name": "values",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "timestamp",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "value",
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
    "name": "PrometheusQueryTemplatePreviewQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "PrometheusQueryTemplatePreviewQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "0f242107d6502f88118101fae35c21f5",
    "id": null,
    "metadata": {},
    "name": "PrometheusQueryTemplatePreviewQuery",
    "operationKind": "query",
    "text": "query PrometheusQueryTemplatePreviewQuery(\n  $queryTemplate: String!\n) {\n  adminPreviewPrometheusQueryPreset(input: {queryTemplate: $queryTemplate}) {\n    status\n    result {\n      values {\n        timestamp\n        value\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "fea104d590115a6372f88fc47d4a0607";

export default node;

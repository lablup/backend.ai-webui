/**
 * @generated SignedSource<<676edfa182e802f7b153e707efd9d3af>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type QueryTimeRangeInput = {
  end: string;
  start: string;
  step: string;
};
export type ExecuteQueryDefinitionOptionsInput = {
  filterLabels?: ReadonlyArray<MetricLabelEntryInput> | null | undefined;
  groupLabels?: ReadonlyArray<string> | null | undefined;
};
export type MetricLabelEntryInput = {
  key: string;
  value: string;
};
export type DeploymentVllmMetricsButtonResultQuery$variables = {
  options?: ExecuteQueryDefinitionOptionsInput | null | undefined;
  presetId: string;
  timeRange?: QueryTimeRangeInput | null | undefined;
};
export type DeploymentVllmMetricsButtonResultQuery$data = {
  readonly prometheusQueryPresetResult: {
    readonly result: ReadonlyArray<{
      readonly values: ReadonlyArray<{
        readonly timestamp: number;
        readonly value: string;
      }>;
    }>;
    readonly status: string;
  } | null | undefined;
};
export type DeploymentVllmMetricsButtonResultQuery = {
  response: DeploymentVllmMetricsButtonResultQuery$data;
  variables: DeploymentVllmMetricsButtonResultQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "options"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "presetId"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "timeRange"
},
v3 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "id",
        "variableName": "presetId"
      },
      {
        "kind": "Variable",
        "name": "options",
        "variableName": "options"
      },
      {
        "kind": "Variable",
        "name": "timeRange",
        "variableName": "timeRange"
      }
    ],
    "concreteType": "QueryDefinitionExecuteResult",
    "kind": "LinkedField",
    "name": "prometheusQueryPresetResult",
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
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "DeploymentVllmMetricsButtonResultQuery",
    "selections": (v3/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v2/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "DeploymentVllmMetricsButtonResultQuery",
    "selections": (v3/*: any*/)
  },
  "params": {
    "cacheID": "b71e2923a3980c544ef9113ed167bca2",
    "id": null,
    "metadata": {},
    "name": "DeploymentVllmMetricsButtonResultQuery",
    "operationKind": "query",
    "text": "query DeploymentVllmMetricsButtonResultQuery(\n  $presetId: ID!\n  $timeRange: QueryTimeRangeInput\n  $options: ExecuteQueryDefinitionOptionsInput\n) {\n  prometheusQueryPresetResult(id: $presetId, timeRange: $timeRange, options: $options) {\n    status\n    result {\n      values {\n        timestamp\n        value\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "eaa1cc465fb3418cf8706b27448d5a2a";

export default node;

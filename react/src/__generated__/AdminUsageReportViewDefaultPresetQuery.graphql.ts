/**
 * @generated SignedSource<<893e9453cb6585d80888be1ea7c92440>>
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
export type AdminUsageReportViewDefaultPresetQuery$variables = {
  cpuOptions: ExecuteQueryDefinitionOptionsInput;
  gpuOptions: ExecuteQueryDefinitionOptionsInput;
  includeGpu: boolean;
  memOptions: ExecuteQueryDefinitionOptionsInput;
  presetId: string;
  range: QueryTimeRangeInput;
};
export type AdminUsageReportViewDefaultPresetQuery$data = {
  readonly cpu_result: {
    readonly result: ReadonlyArray<{
      readonly metric: ReadonlyArray<{
        readonly key: string;
        readonly value: string;
      }>;
      readonly values: ReadonlyArray<{
        readonly timestamp: number;
        readonly value: string;
      }>;
    }>;
  } | null | undefined;
  readonly gpu_result?: {
    readonly result: ReadonlyArray<{
      readonly metric: ReadonlyArray<{
        readonly key: string;
        readonly value: string;
      }>;
      readonly values: ReadonlyArray<{
        readonly timestamp: number;
        readonly value: string;
      }>;
    }>;
  } | null | undefined;
  readonly mem_result: {
    readonly result: ReadonlyArray<{
      readonly metric: ReadonlyArray<{
        readonly key: string;
        readonly value: string;
      }>;
      readonly values: ReadonlyArray<{
        readonly timestamp: number;
        readonly value: string;
      }>;
    }>;
  } | null | undefined;
};
export type AdminUsageReportViewDefaultPresetQuery = {
  response: AdminUsageReportViewDefaultPresetQuery$data;
  variables: AdminUsageReportViewDefaultPresetQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "cpuOptions"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "gpuOptions"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "includeGpu"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "memOptions"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "presetId"
},
v5 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "range"
},
v6 = {
  "kind": "Variable",
  "name": "id",
  "variableName": "presetId"
},
v7 = {
  "kind": "Variable",
  "name": "timeRange",
  "variableName": "range"
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "value",
  "storageKey": null
},
v9 = [
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
        "concreteType": "MetricLabelEntry",
        "kind": "LinkedField",
        "name": "metric",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "key",
            "storageKey": null
          },
          (v8/*: any*/)
        ],
        "storageKey": null
      },
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
          (v8/*: any*/)
        ],
        "storageKey": null
      }
    ],
    "storageKey": null
  }
],
v10 = [
  {
    "alias": "cpu_result",
    "args": [
      (v6/*: any*/),
      {
        "kind": "Variable",
        "name": "options",
        "variableName": "cpuOptions"
      },
      (v7/*: any*/)
    ],
    "concreteType": "QueryDefinitionExecuteResult",
    "kind": "LinkedField",
    "name": "prometheusQueryPresetResult",
    "plural": false,
    "selections": (v9/*: any*/),
    "storageKey": null
  },
  {
    "alias": "mem_result",
    "args": [
      (v6/*: any*/),
      {
        "kind": "Variable",
        "name": "options",
        "variableName": "memOptions"
      },
      (v7/*: any*/)
    ],
    "concreteType": "QueryDefinitionExecuteResult",
    "kind": "LinkedField",
    "name": "prometheusQueryPresetResult",
    "plural": false,
    "selections": (v9/*: any*/),
    "storageKey": null
  },
  {
    "condition": "includeGpu",
    "kind": "Condition",
    "passingValue": true,
    "selections": [
      {
        "alias": "gpu_result",
        "args": [
          (v6/*: any*/),
          {
            "kind": "Variable",
            "name": "options",
            "variableName": "gpuOptions"
          },
          (v7/*: any*/)
        ],
        "concreteType": "QueryDefinitionExecuteResult",
        "kind": "LinkedField",
        "name": "prometheusQueryPresetResult",
        "plural": false,
        "selections": (v9/*: any*/),
        "storageKey": null
      }
    ]
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/),
      (v4/*: any*/),
      (v5/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "AdminUsageReportViewDefaultPresetQuery",
    "selections": (v10/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v4/*: any*/),
      (v5/*: any*/),
      (v0/*: any*/),
      (v3/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Operation",
    "name": "AdminUsageReportViewDefaultPresetQuery",
    "selections": (v10/*: any*/)
  },
  "params": {
    "cacheID": "6c80b6a8cbc29af2d93d8ee53c3c4ff2",
    "id": null,
    "metadata": {},
    "name": "AdminUsageReportViewDefaultPresetQuery",
    "operationKind": "query",
    "text": "query AdminUsageReportViewDefaultPresetQuery(\n  $presetId: ID!\n  $range: QueryTimeRangeInput!\n  $cpuOptions: ExecuteQueryDefinitionOptionsInput!\n  $memOptions: ExecuteQueryDefinitionOptionsInput!\n  $gpuOptions: ExecuteQueryDefinitionOptionsInput!\n  $includeGpu: Boolean!\n) {\n  cpu_result: prometheusQueryPresetResult(id: $presetId, timeRange: $range, options: $cpuOptions) {\n    result {\n      metric {\n        key\n        value\n      }\n      values {\n        timestamp\n        value\n      }\n    }\n  }\n  mem_result: prometheusQueryPresetResult(id: $presetId, timeRange: $range, options: $memOptions) {\n    result {\n      metric {\n        key\n        value\n      }\n      values {\n        timestamp\n        value\n      }\n    }\n  }\n  gpu_result: prometheusQueryPresetResult(id: $presetId, timeRange: $range, options: $gpuOptions) @include(if: $includeGpu) {\n    result {\n      metric {\n        key\n        value\n      }\n      values {\n        timestamp\n        value\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "787c5933fea7371fcee9e766f2e3f0a5";

export default node;

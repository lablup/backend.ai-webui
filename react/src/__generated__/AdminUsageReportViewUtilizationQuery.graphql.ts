/**
 * @generated SignedSource<<6831b63bbc088eca52abfa425cb82629>>
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
export type AdminUsageReportViewUtilizationQuery$variables = {
  avgRange: QueryTimeRangeInput;
  avgWindow: string;
  cpuAvgId: string;
  cpuSeriesId: string;
  gpuAvgId: string;
  gpuSeriesId: string;
  memAvgId: string;
  memSeriesId: string;
  seriesRange: QueryTimeRangeInput;
};
export type AdminUsageReportViewUtilizationQuery$data = {
  readonly cpu_avg: {
    readonly result: ReadonlyArray<{
      readonly values: ReadonlyArray<{
        readonly timestamp: number;
        readonly value: string;
      }>;
    }>;
  } | null | undefined;
  readonly cpu_series: {
    readonly result: ReadonlyArray<{
      readonly values: ReadonlyArray<{
        readonly timestamp: number;
        readonly value: string;
      }>;
    }>;
  } | null | undefined;
  readonly gpu_avg: {
    readonly result: ReadonlyArray<{
      readonly values: ReadonlyArray<{
        readonly timestamp: number;
        readonly value: string;
      }>;
    }>;
  } | null | undefined;
  readonly gpu_series: {
    readonly result: ReadonlyArray<{
      readonly values: ReadonlyArray<{
        readonly timestamp: number;
        readonly value: string;
      }>;
    }>;
  } | null | undefined;
  readonly mem_avg: {
    readonly result: ReadonlyArray<{
      readonly values: ReadonlyArray<{
        readonly timestamp: number;
        readonly value: string;
      }>;
    }>;
  } | null | undefined;
  readonly mem_series: {
    readonly result: ReadonlyArray<{
      readonly values: ReadonlyArray<{
        readonly timestamp: number;
        readonly value: string;
      }>;
    }>;
  } | null | undefined;
};
export type AdminUsageReportViewUtilizationQuery = {
  response: AdminUsageReportViewUtilizationQuery$data;
  variables: AdminUsageReportViewUtilizationQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "avgRange"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "avgWindow"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "cpuAvgId"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "cpuSeriesId"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "gpuAvgId"
},
v5 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "gpuSeriesId"
},
v6 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "memAvgId"
},
v7 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "memSeriesId"
},
v8 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "seriesRange"
},
v9 = {
  "kind": "Variable",
  "name": "timeRange",
  "variableName": "seriesRange"
},
v10 = [
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
v11 = {
  "kind": "Variable",
  "name": "timeRange",
  "variableName": "avgRange"
},
v12 = {
  "kind": "Variable",
  "name": "timeWindow",
  "variableName": "avgWindow"
},
v13 = [
  {
    "alias": "cpu_series",
    "args": [
      {
        "kind": "Variable",
        "name": "id",
        "variableName": "cpuSeriesId"
      },
      (v9/*: any*/)
    ],
    "concreteType": "QueryDefinitionExecuteResult",
    "kind": "LinkedField",
    "name": "prometheusQueryPresetResult",
    "plural": false,
    "selections": (v10/*: any*/),
    "storageKey": null
  },
  {
    "alias": "gpu_series",
    "args": [
      {
        "kind": "Variable",
        "name": "id",
        "variableName": "gpuSeriesId"
      },
      (v9/*: any*/)
    ],
    "concreteType": "QueryDefinitionExecuteResult",
    "kind": "LinkedField",
    "name": "prometheusQueryPresetResult",
    "plural": false,
    "selections": (v10/*: any*/),
    "storageKey": null
  },
  {
    "alias": "mem_series",
    "args": [
      {
        "kind": "Variable",
        "name": "id",
        "variableName": "memSeriesId"
      },
      (v9/*: any*/)
    ],
    "concreteType": "QueryDefinitionExecuteResult",
    "kind": "LinkedField",
    "name": "prometheusQueryPresetResult",
    "plural": false,
    "selections": (v10/*: any*/),
    "storageKey": null
  },
  {
    "alias": "cpu_avg",
    "args": [
      {
        "kind": "Variable",
        "name": "id",
        "variableName": "cpuAvgId"
      },
      (v11/*: any*/),
      (v12/*: any*/)
    ],
    "concreteType": "QueryDefinitionExecuteResult",
    "kind": "LinkedField",
    "name": "prometheusQueryPresetResult",
    "plural": false,
    "selections": (v10/*: any*/),
    "storageKey": null
  },
  {
    "alias": "gpu_avg",
    "args": [
      {
        "kind": "Variable",
        "name": "id",
        "variableName": "gpuAvgId"
      },
      (v11/*: any*/),
      (v12/*: any*/)
    ],
    "concreteType": "QueryDefinitionExecuteResult",
    "kind": "LinkedField",
    "name": "prometheusQueryPresetResult",
    "plural": false,
    "selections": (v10/*: any*/),
    "storageKey": null
  },
  {
    "alias": "mem_avg",
    "args": [
      {
        "kind": "Variable",
        "name": "id",
        "variableName": "memAvgId"
      },
      (v11/*: any*/),
      (v12/*: any*/)
    ],
    "concreteType": "QueryDefinitionExecuteResult",
    "kind": "LinkedField",
    "name": "prometheusQueryPresetResult",
    "plural": false,
    "selections": (v10/*: any*/),
    "storageKey": null
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
      (v5/*: any*/),
      (v6/*: any*/),
      (v7/*: any*/),
      (v8/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "AdminUsageReportViewUtilizationQuery",
    "selections": (v13/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v3/*: any*/),
      (v5/*: any*/),
      (v7/*: any*/),
      (v2/*: any*/),
      (v4/*: any*/),
      (v6/*: any*/),
      (v8/*: any*/),
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Operation",
    "name": "AdminUsageReportViewUtilizationQuery",
    "selections": (v13/*: any*/)
  },
  "params": {
    "cacheID": "3a43b916e1ff42d5d0b84896d6f8c42d",
    "id": null,
    "metadata": {},
    "name": "AdminUsageReportViewUtilizationQuery",
    "operationKind": "query",
    "text": "query AdminUsageReportViewUtilizationQuery(\n  $cpuSeriesId: ID!\n  $gpuSeriesId: ID!\n  $memSeriesId: ID!\n  $cpuAvgId: ID!\n  $gpuAvgId: ID!\n  $memAvgId: ID!\n  $seriesRange: QueryTimeRangeInput!\n  $avgRange: QueryTimeRangeInput!\n  $avgWindow: String!\n) {\n  cpu_series: prometheusQueryPresetResult(id: $cpuSeriesId, timeRange: $seriesRange) {\n    result {\n      values {\n        timestamp\n        value\n      }\n    }\n  }\n  gpu_series: prometheusQueryPresetResult(id: $gpuSeriesId, timeRange: $seriesRange) {\n    result {\n      values {\n        timestamp\n        value\n      }\n    }\n  }\n  mem_series: prometheusQueryPresetResult(id: $memSeriesId, timeRange: $seriesRange) {\n    result {\n      values {\n        timestamp\n        value\n      }\n    }\n  }\n  cpu_avg: prometheusQueryPresetResult(id: $cpuAvgId, timeRange: $avgRange, timeWindow: $avgWindow) {\n    result {\n      values {\n        timestamp\n        value\n      }\n    }\n  }\n  gpu_avg: prometheusQueryPresetResult(id: $gpuAvgId, timeRange: $avgRange, timeWindow: $avgWindow) {\n    result {\n      values {\n        timestamp\n        value\n      }\n    }\n  }\n  mem_avg: prometheusQueryPresetResult(id: $memAvgId, timeRange: $avgRange, timeWindow: $avgWindow) {\n    result {\n      values {\n        timestamp\n        value\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "9288da4db778c06b9ebed433be311ca9";

export default node;

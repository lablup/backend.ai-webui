/**
 * @generated SignedSource<<8a9f9a7451158e281b07516da8ad0213>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type UserUtilizationMetricQueryInput = {
  end: string;
  metric_name: string;
  start: string;
  step: string;
  value_type?: string | null | undefined;
};
export type UserUsageReportViewUtilizationQuery$variables = {
  cpuCapacityProps: UserUtilizationMetricQueryInput;
  cpuCurrentProps: UserUtilizationMetricQueryInput;
  gpuCapacityProps: UserUtilizationMetricQueryInput;
  gpuCurrentProps: UserUtilizationMetricQueryInput;
  includeGpu: boolean;
  memCapacityProps: UserUtilizationMetricQueryInput;
  memCurrentProps: UserUtilizationMetricQueryInput;
  user_id: string;
};
export type UserUsageReportViewUtilizationQuery$data = {
  readonly cpu_capacity: {
    readonly metrics: ReadonlyArray<{
      readonly avg_value: string | null | undefined;
      readonly metric_name: string | null | undefined;
      readonly values: ReadonlyArray<{
        readonly timestamp: number | null | undefined;
        readonly value: string | null | undefined;
      } | null | undefined> | null | undefined;
    } | null | undefined> | null | undefined;
  } | null | undefined;
  readonly cpu_current: {
    readonly metrics: ReadonlyArray<{
      readonly avg_value: string | null | undefined;
      readonly metric_name: string | null | undefined;
      readonly values: ReadonlyArray<{
        readonly timestamp: number | null | undefined;
        readonly value: string | null | undefined;
      } | null | undefined> | null | undefined;
    } | null | undefined> | null | undefined;
  } | null | undefined;
  readonly gpu_capacity?: {
    readonly metrics: ReadonlyArray<{
      readonly avg_value: string | null | undefined;
      readonly metric_name: string | null | undefined;
      readonly values: ReadonlyArray<{
        readonly timestamp: number | null | undefined;
        readonly value: string | null | undefined;
      } | null | undefined> | null | undefined;
    } | null | undefined> | null | undefined;
  } | null | undefined;
  readonly gpu_current?: {
    readonly metrics: ReadonlyArray<{
      readonly avg_value: string | null | undefined;
      readonly metric_name: string | null | undefined;
      readonly values: ReadonlyArray<{
        readonly timestamp: number | null | undefined;
        readonly value: string | null | undefined;
      } | null | undefined> | null | undefined;
    } | null | undefined> | null | undefined;
  } | null | undefined;
  readonly mem_capacity: {
    readonly metrics: ReadonlyArray<{
      readonly avg_value: string | null | undefined;
      readonly metric_name: string | null | undefined;
      readonly values: ReadonlyArray<{
        readonly timestamp: number | null | undefined;
        readonly value: string | null | undefined;
      } | null | undefined> | null | undefined;
    } | null | undefined> | null | undefined;
  } | null | undefined;
  readonly mem_current: {
    readonly metrics: ReadonlyArray<{
      readonly avg_value: string | null | undefined;
      readonly metric_name: string | null | undefined;
      readonly values: ReadonlyArray<{
        readonly timestamp: number | null | undefined;
        readonly value: string | null | undefined;
      } | null | undefined> | null | undefined;
    } | null | undefined> | null | undefined;
  } | null | undefined;
};
export type UserUsageReportViewUtilizationQuery = {
  response: UserUsageReportViewUtilizationQuery$data;
  variables: UserUsageReportViewUtilizationQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "cpuCapacityProps"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "cpuCurrentProps"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "gpuCapacityProps"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "gpuCurrentProps"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "includeGpu"
},
v5 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "memCapacityProps"
},
v6 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "memCurrentProps"
},
v7 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "user_id"
},
v8 = {
  "kind": "Variable",
  "name": "user_id",
  "variableName": "user_id"
},
v9 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "ContainerUtilizationMetric",
    "kind": "LinkedField",
    "name": "metrics",
    "plural": true,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "metric_name",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "avg_value",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "MetricResultValue",
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
v10 = [
  {
    "alias": "cpu_current",
    "args": [
      {
        "kind": "Variable",
        "name": "props",
        "variableName": "cpuCurrentProps"
      },
      (v8/*: any*/)
    ],
    "concreteType": "UserUtilizationMetric",
    "kind": "LinkedField",
    "name": "user_utilization_metric",
    "plural": false,
    "selections": (v9/*: any*/),
    "storageKey": null
  },
  {
    "alias": "cpu_capacity",
    "args": [
      {
        "kind": "Variable",
        "name": "props",
        "variableName": "cpuCapacityProps"
      },
      (v8/*: any*/)
    ],
    "concreteType": "UserUtilizationMetric",
    "kind": "LinkedField",
    "name": "user_utilization_metric",
    "plural": false,
    "selections": (v9/*: any*/),
    "storageKey": null
  },
  {
    "alias": "mem_current",
    "args": [
      {
        "kind": "Variable",
        "name": "props",
        "variableName": "memCurrentProps"
      },
      (v8/*: any*/)
    ],
    "concreteType": "UserUtilizationMetric",
    "kind": "LinkedField",
    "name": "user_utilization_metric",
    "plural": false,
    "selections": (v9/*: any*/),
    "storageKey": null
  },
  {
    "alias": "mem_capacity",
    "args": [
      {
        "kind": "Variable",
        "name": "props",
        "variableName": "memCapacityProps"
      },
      (v8/*: any*/)
    ],
    "concreteType": "UserUtilizationMetric",
    "kind": "LinkedField",
    "name": "user_utilization_metric",
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
        "alias": "gpu_current",
        "args": [
          {
            "kind": "Variable",
            "name": "props",
            "variableName": "gpuCurrentProps"
          },
          (v8/*: any*/)
        ],
        "concreteType": "UserUtilizationMetric",
        "kind": "LinkedField",
        "name": "user_utilization_metric",
        "plural": false,
        "selections": (v9/*: any*/),
        "storageKey": null
      },
      {
        "alias": "gpu_capacity",
        "args": [
          {
            "kind": "Variable",
            "name": "props",
            "variableName": "gpuCapacityProps"
          },
          (v8/*: any*/)
        ],
        "concreteType": "UserUtilizationMetric",
        "kind": "LinkedField",
        "name": "user_utilization_metric",
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
      (v5/*: any*/),
      (v6/*: any*/),
      (v7/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "UserUsageReportViewUtilizationQuery",
    "selections": (v10/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v7/*: any*/),
      (v1/*: any*/),
      (v0/*: any*/),
      (v6/*: any*/),
      (v5/*: any*/),
      (v3/*: any*/),
      (v2/*: any*/),
      (v4/*: any*/)
    ],
    "kind": "Operation",
    "name": "UserUsageReportViewUtilizationQuery",
    "selections": (v10/*: any*/)
  },
  "params": {
    "cacheID": "e11bcbc049ec539f37edcf99a2b492e7",
    "id": null,
    "metadata": {},
    "name": "UserUsageReportViewUtilizationQuery",
    "operationKind": "query",
    "text": "query UserUsageReportViewUtilizationQuery(\n  $user_id: UUID!\n  $cpuCurrentProps: UserUtilizationMetricQueryInput!\n  $cpuCapacityProps: UserUtilizationMetricQueryInput!\n  $memCurrentProps: UserUtilizationMetricQueryInput!\n  $memCapacityProps: UserUtilizationMetricQueryInput!\n  $gpuCurrentProps: UserUtilizationMetricQueryInput!\n  $gpuCapacityProps: UserUtilizationMetricQueryInput!\n  $includeGpu: Boolean!\n) {\n  cpu_current: user_utilization_metric(user_id: $user_id, props: $cpuCurrentProps) {\n    metrics {\n      metric_name\n      avg_value\n      values {\n        timestamp\n        value\n      }\n    }\n  }\n  cpu_capacity: user_utilization_metric(user_id: $user_id, props: $cpuCapacityProps) {\n    metrics {\n      metric_name\n      avg_value\n      values {\n        timestamp\n        value\n      }\n    }\n  }\n  mem_current: user_utilization_metric(user_id: $user_id, props: $memCurrentProps) {\n    metrics {\n      metric_name\n      avg_value\n      values {\n        timestamp\n        value\n      }\n    }\n  }\n  mem_capacity: user_utilization_metric(user_id: $user_id, props: $memCapacityProps) {\n    metrics {\n      metric_name\n      avg_value\n      values {\n        timestamp\n        value\n      }\n    }\n  }\n  gpu_current: user_utilization_metric(user_id: $user_id, props: $gpuCurrentProps) @include(if: $includeGpu) {\n    metrics {\n      metric_name\n      avg_value\n      values {\n        timestamp\n        value\n      }\n    }\n  }\n  gpu_capacity: user_utilization_metric(user_id: $user_id, props: $gpuCapacityProps) @include(if: $includeGpu) {\n    metrics {\n      metric_name\n      avg_value\n      values {\n        timestamp\n        value\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "3963782d20ca6c9a76ec451d98cbf59f";

export default node;

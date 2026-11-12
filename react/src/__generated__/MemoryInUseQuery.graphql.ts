/**
 * @generated SignedSource<<65d7e63abe0f87fc4724cff6fe3500ae>>
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
export type MemoryInUseQuery$variables = {
  accCapacity: UserUtilizationMetricQueryInput;
  accCurrent: UserUtilizationMetricQueryInput;
  hasAccelerator: boolean;
  hasMemory: boolean;
  memCapacity: UserUtilizationMetricQueryInput;
  memCurrent: UserUtilizationMetricQueryInput;
  userId: string;
};
export type MemoryInUseQuery$data = {
  readonly accCapacity?: {
    readonly metrics: ReadonlyArray<{
      readonly values: ReadonlyArray<{
        readonly value: string | null | undefined;
      } | null | undefined> | null | undefined;
    } | null | undefined> | null | undefined;
  } | null | undefined;
  readonly accCurrent?: {
    readonly metrics: ReadonlyArray<{
      readonly values: ReadonlyArray<{
        readonly value: string | null | undefined;
      } | null | undefined> | null | undefined;
    } | null | undefined> | null | undefined;
  } | null | undefined;
  readonly memCapacity?: {
    readonly metrics: ReadonlyArray<{
      readonly values: ReadonlyArray<{
        readonly value: string | null | undefined;
      } | null | undefined> | null | undefined;
    } | null | undefined> | null | undefined;
  } | null | undefined;
  readonly memCurrent?: {
    readonly metrics: ReadonlyArray<{
      readonly values: ReadonlyArray<{
        readonly value: string | null | undefined;
      } | null | undefined> | null | undefined;
    } | null | undefined> | null | undefined;
  } | null | undefined;
};
export type MemoryInUseQuery = {
  response: MemoryInUseQuery$data;
  variables: MemoryInUseQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "accCapacity"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "accCurrent"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "hasAccelerator"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "hasMemory"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "memCapacity"
},
v5 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "memCurrent"
},
v6 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "userId"
},
v7 = {
  "kind": "Variable",
  "name": "user_id",
  "variableName": "userId"
},
v8 = [
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
        "concreteType": "MetricResultValue",
        "kind": "LinkedField",
        "name": "values",
        "plural": true,
        "selections": [
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
v9 = [
  {
    "condition": "hasMemory",
    "kind": "Condition",
    "passingValue": true,
    "selections": [
      {
        "alias": "memCapacity",
        "args": [
          {
            "kind": "Variable",
            "name": "props",
            "variableName": "memCapacity"
          },
          (v7/*: any*/)
        ],
        "concreteType": "UserUtilizationMetric",
        "kind": "LinkedField",
        "name": "user_utilization_metric",
        "plural": false,
        "selections": (v8/*: any*/),
        "storageKey": null
      },
      {
        "alias": "memCurrent",
        "args": [
          {
            "kind": "Variable",
            "name": "props",
            "variableName": "memCurrent"
          },
          (v7/*: any*/)
        ],
        "concreteType": "UserUtilizationMetric",
        "kind": "LinkedField",
        "name": "user_utilization_metric",
        "plural": false,
        "selections": (v8/*: any*/),
        "storageKey": null
      }
    ]
  },
  {
    "condition": "hasAccelerator",
    "kind": "Condition",
    "passingValue": true,
    "selections": [
      {
        "alias": "accCapacity",
        "args": [
          {
            "kind": "Variable",
            "name": "props",
            "variableName": "accCapacity"
          },
          (v7/*: any*/)
        ],
        "concreteType": "UserUtilizationMetric",
        "kind": "LinkedField",
        "name": "user_utilization_metric",
        "plural": false,
        "selections": (v8/*: any*/),
        "storageKey": null
      },
      {
        "alias": "accCurrent",
        "args": [
          {
            "kind": "Variable",
            "name": "props",
            "variableName": "accCurrent"
          },
          (v7/*: any*/)
        ],
        "concreteType": "UserUtilizationMetric",
        "kind": "LinkedField",
        "name": "user_utilization_metric",
        "plural": false,
        "selections": (v8/*: any*/),
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
      (v6/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "MemoryInUseQuery",
    "selections": (v9/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v6/*: any*/),
      (v4/*: any*/),
      (v5/*: any*/),
      (v0/*: any*/),
      (v1/*: any*/),
      (v3/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Operation",
    "name": "MemoryInUseQuery",
    "selections": (v9/*: any*/)
  },
  "params": {
    "cacheID": "e311990fa127d0b4235f7ccf7260eba3",
    "id": null,
    "metadata": {},
    "name": "MemoryInUseQuery",
    "operationKind": "query",
    "text": "query MemoryInUseQuery(\n  $userId: UUID!\n  $memCapacity: UserUtilizationMetricQueryInput!\n  $memCurrent: UserUtilizationMetricQueryInput!\n  $accCapacity: UserUtilizationMetricQueryInput!\n  $accCurrent: UserUtilizationMetricQueryInput!\n  $hasMemory: Boolean!\n  $hasAccelerator: Boolean!\n) {\n  memCapacity: user_utilization_metric(user_id: $userId, props: $memCapacity) @include(if: $hasMemory) {\n    metrics {\n      values {\n        value\n      }\n    }\n  }\n  memCurrent: user_utilization_metric(user_id: $userId, props: $memCurrent) @include(if: $hasMemory) {\n    metrics {\n      values {\n        value\n      }\n    }\n  }\n  accCapacity: user_utilization_metric(user_id: $userId, props: $accCapacity) @include(if: $hasAccelerator) {\n    metrics {\n      values {\n        value\n      }\n    }\n  }\n  accCurrent: user_utilization_metric(user_id: $userId, props: $accCurrent) @include(if: $hasAccelerator) {\n    metrics {\n      values {\n        value\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "97deccae20bca069472d25aecb87a237";

export default node;

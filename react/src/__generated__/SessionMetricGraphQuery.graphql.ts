/**
 * @generated SignedSource<<3d95e3279a7eebcedba46ed93b21a4c9>>
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
export type SessionMetricGraphQuery$variables = {
  capacityProps: UserUtilizationMetricQueryInput;
  currentProps: UserUtilizationMetricQueryInput;
  user_id: string;
};
export type SessionMetricGraphQuery$data = {
  readonly capacity_metric: {
    readonly metrics: ReadonlyArray<{
      readonly avg_value: string | null | undefined;
      readonly max_value: string | null | undefined;
      readonly metric_name: string | null | undefined;
      readonly value_type: string | null | undefined;
      readonly values: ReadonlyArray<{
        readonly timestamp: number | null | undefined;
        readonly value: string | null | undefined;
      } | null | undefined> | null | undefined;
    } | null | undefined> | null | undefined;
    readonly user_id: string | null | undefined;
  } | null | undefined;
  readonly current_metric: {
    readonly metrics: ReadonlyArray<{
      readonly avg_value: string | null | undefined;
      readonly max_value: string | null | undefined;
      readonly metric_name: string | null | undefined;
      readonly value_type: string | null | undefined;
      readonly values: ReadonlyArray<{
        readonly timestamp: number | null | undefined;
        readonly value: string | null | undefined;
      } | null | undefined> | null | undefined;
    } | null | undefined> | null | undefined;
    readonly user_id: string | null | undefined;
  } | null | undefined;
};
export type SessionMetricGraphQuery = {
  response: SessionMetricGraphQuery$data;
  variables: SessionMetricGraphQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "capacityProps"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "currentProps"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "user_id"
},
v3 = {
  "kind": "Variable",
  "name": "user_id",
  "variableName": "user_id"
},
v4 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "user_id",
    "storageKey": null
  },
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
        "name": "value_type",
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
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "max_value",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "avg_value",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
],
v5 = [
  {
    "alias": "capacity_metric",
    "args": [
      {
        "kind": "Variable",
        "name": "props",
        "variableName": "capacityProps"
      },
      (v3/*: any*/)
    ],
    "concreteType": "UserUtilizationMetric",
    "kind": "LinkedField",
    "name": "user_utilization_metric",
    "plural": false,
    "selections": (v4/*: any*/),
    "storageKey": null
  },
  {
    "alias": "current_metric",
    "args": [
      {
        "kind": "Variable",
        "name": "props",
        "variableName": "currentProps"
      },
      (v3/*: any*/)
    ],
    "concreteType": "UserUtilizationMetric",
    "kind": "LinkedField",
    "name": "user_utilization_metric",
    "plural": false,
    "selections": (v4/*: any*/),
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
    "name": "SessionMetricGraphQuery",
    "selections": (v5/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v2/*: any*/),
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Operation",
    "name": "SessionMetricGraphQuery",
    "selections": (v5/*: any*/)
  },
  "params": {
    "cacheID": "aa2a1000ef4410eaa2da853eabbdf0d6",
    "id": null,
    "metadata": {},
    "name": "SessionMetricGraphQuery",
    "operationKind": "query",
    "text": "query SessionMetricGraphQuery(\n  $user_id: UUID!\n  $capacityProps: UserUtilizationMetricQueryInput!\n  $currentProps: UserUtilizationMetricQueryInput!\n) {\n  capacity_metric: user_utilization_metric(user_id: $user_id, props: $capacityProps) {\n    user_id\n    metrics {\n      metric_name\n      value_type\n      values {\n        timestamp\n        value\n      }\n      max_value\n      avg_value\n    }\n  }\n  current_metric: user_utilization_metric(user_id: $user_id, props: $currentProps) {\n    user_id\n    metrics {\n      metric_name\n      value_type\n      values {\n        timestamp\n        value\n      }\n      max_value\n      avg_value\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "88c8725f744a307e05f63cff149489f0";

export default node;

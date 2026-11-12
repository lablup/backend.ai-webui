/**
 * @generated SignedSource<<305ebca194920939edea33c07c0ef780>>
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
export type MemoryInUseNoteQuery$variables = {
  capacityProps: UserUtilizationMetricQueryInput;
  currentProps: UserUtilizationMetricQueryInput;
  isReported: boolean;
  userId: string;
};
export type MemoryInUseNoteQuery$data = {
  readonly capacity?: {
    readonly metrics: ReadonlyArray<{
      readonly values: ReadonlyArray<{
        readonly value: string | null | undefined;
      } | null | undefined> | null | undefined;
    } | null | undefined> | null | undefined;
  } | null | undefined;
  readonly current?: {
    readonly metrics: ReadonlyArray<{
      readonly values: ReadonlyArray<{
        readonly value: string | null | undefined;
      } | null | undefined> | null | undefined;
    } | null | undefined> | null | undefined;
  } | null | undefined;
};
export type MemoryInUseNoteQuery = {
  response: MemoryInUseNoteQuery$data;
  variables: MemoryInUseNoteQuery$variables;
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
  "name": "isReported"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "userId"
},
v4 = {
  "kind": "Variable",
  "name": "user_id",
  "variableName": "userId"
},
v5 = [
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
v6 = [
  {
    "condition": "isReported",
    "kind": "Condition",
    "passingValue": true,
    "selections": [
      {
        "alias": "capacity",
        "args": [
          {
            "kind": "Variable",
            "name": "props",
            "variableName": "capacityProps"
          },
          (v4/*: any*/)
        ],
        "concreteType": "UserUtilizationMetric",
        "kind": "LinkedField",
        "name": "user_utilization_metric",
        "plural": false,
        "selections": (v5/*: any*/),
        "storageKey": null
      },
      {
        "alias": "current",
        "args": [
          {
            "kind": "Variable",
            "name": "props",
            "variableName": "currentProps"
          },
          (v4/*: any*/)
        ],
        "concreteType": "UserUtilizationMetric",
        "kind": "LinkedField",
        "name": "user_utilization_metric",
        "plural": false,
        "selections": (v5/*: any*/),
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
      (v3/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "MemoryInUseNoteQuery",
    "selections": (v6/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v3/*: any*/),
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Operation",
    "name": "MemoryInUseNoteQuery",
    "selections": (v6/*: any*/)
  },
  "params": {
    "cacheID": "30e4a42e6a942faee2b17f3a75785336",
    "id": null,
    "metadata": {},
    "name": "MemoryInUseNoteQuery",
    "operationKind": "query",
    "text": "query MemoryInUseNoteQuery(\n  $userId: UUID!\n  $capacityProps: UserUtilizationMetricQueryInput!\n  $currentProps: UserUtilizationMetricQueryInput!\n  $isReported: Boolean!\n) {\n  capacity: user_utilization_metric(user_id: $userId, props: $capacityProps) @include(if: $isReported) {\n    metrics {\n      values {\n        value\n      }\n    }\n  }\n  current: user_utilization_metric(user_id: $userId, props: $currentProps) @include(if: $isReported) {\n    metrics {\n      values {\n        value\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "7abdd0d62b07e9dd1be2ceef88b435d7";

export default node;

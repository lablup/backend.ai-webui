/**
 * @generated SignedSource<<91db2e5a08d9f41aa81e60928daefa78>>
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
  userId: string;
};
export type MemoryInUseNoteQuery$data = {
  readonly capacity: {
    readonly metrics: ReadonlyArray<{
      readonly values: ReadonlyArray<{
        readonly value: string | null | undefined;
      } | null | undefined> | null | undefined;
    } | null | undefined> | null | undefined;
  } | null | undefined;
  readonly current: {
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
  "name": "userId"
},
v3 = {
  "kind": "Variable",
  "name": "user_id",
  "variableName": "userId"
},
v4 = [
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
v5 = [
  {
    "alias": "capacity",
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
    "alias": "current",
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
    "name": "MemoryInUseNoteQuery",
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
    "name": "MemoryInUseNoteQuery",
    "selections": (v5/*: any*/)
  },
  "params": {
    "cacheID": "d82da18638fbd5c044891996efbb51f1",
    "id": null,
    "metadata": {},
    "name": "MemoryInUseNoteQuery",
    "operationKind": "query",
    "text": "query MemoryInUseNoteQuery(\n  $userId: UUID!\n  $capacityProps: UserUtilizationMetricQueryInput!\n  $currentProps: UserUtilizationMetricQueryInput!\n) {\n  capacity: user_utilization_metric(user_id: $userId, props: $capacityProps) {\n    metrics {\n      values {\n        value\n      }\n    }\n  }\n  current: user_utilization_metric(user_id: $userId, props: $currentProps) {\n    metrics {\n      values {\n        value\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "e08b8cbe477e75879d81abde8306e59e";

export default node;

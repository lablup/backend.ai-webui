/**
 * @generated SignedSource<<11b1dca351f9b43ed87c6b19b9d755d2>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type MemoryInUseMetricNamesQuery$variables = Record<PropertyKey, never>;
export type MemoryInUseMetricNamesQuery$data = {
  readonly container_utilization_metric_metadata: {
    readonly metric_names: ReadonlyArray<string | null | undefined> | null | undefined;
  } | null | undefined;
};
export type MemoryInUseMetricNamesQuery = {
  response: MemoryInUseMetricNamesQuery$data;
  variables: MemoryInUseMetricNamesQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "ContainerUtilizationMetricMetadata",
    "kind": "LinkedField",
    "name": "container_utilization_metric_metadata",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "metric_names",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "MemoryInUseMetricNamesQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "MemoryInUseMetricNamesQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "b739b4907eb90ad2b1d01b21819d4328",
    "id": null,
    "metadata": {},
    "name": "MemoryInUseMetricNamesQuery",
    "operationKind": "query",
    "text": "query MemoryInUseMetricNamesQuery {\n  container_utilization_metric_metadata {\n    metric_names\n  }\n}\n"
  }
};
})();

(node as any).hash = "4317617b052da7d16d9d177e82b265f5";

export default node;

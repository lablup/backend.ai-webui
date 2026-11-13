/**
 * @generated SignedSource<<4bb0045994d9f7513d2e4587a1fea5e4>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type MemoryInUseNoteMetricNamesQuery$variables = Record<PropertyKey, never>;
export type MemoryInUseNoteMetricNamesQuery$data = {
  readonly container_utilization_metric_metadata: {
    readonly metric_names: ReadonlyArray<string | null | undefined> | null | undefined;
  } | null | undefined;
};
export type MemoryInUseNoteMetricNamesQuery = {
  response: MemoryInUseNoteMetricNamesQuery$data;
  variables: MemoryInUseNoteMetricNamesQuery$variables;
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
    "name": "MemoryInUseNoteMetricNamesQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "MemoryInUseNoteMetricNamesQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "7fbb1d305a9c24e54f269cace56e93eb",
    "id": null,
    "metadata": {},
    "name": "MemoryInUseNoteMetricNamesQuery",
    "operationKind": "query",
    "text": "query MemoryInUseNoteMetricNamesQuery {\n  container_utilization_metric_metadata {\n    metric_names\n  }\n}\n"
  }
};
})();

(node as any).hash = "f2ccc134ec4bb5fdb695cad7ab39c1cb";

export default node;

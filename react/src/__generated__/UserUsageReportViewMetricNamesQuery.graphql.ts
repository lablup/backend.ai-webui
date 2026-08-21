/**
 * @generated SignedSource<<3a0bfa9a8cab26d978db570441e20989>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type UserUsageReportViewMetricNamesQuery$variables = Record<PropertyKey, never>;
export type UserUsageReportViewMetricNamesQuery$data = {
  readonly container_utilization_metric_metadata: {
    readonly metric_names: ReadonlyArray<string | null | undefined> | null | undefined;
  } | null | undefined;
};
export type UserUsageReportViewMetricNamesQuery = {
  response: UserUsageReportViewMetricNamesQuery$data;
  variables: UserUsageReportViewMetricNamesQuery$variables;
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
    "name": "UserUsageReportViewMetricNamesQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "UserUsageReportViewMetricNamesQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "5008eb7d630cabc7c214a958ec00b4c2",
    "id": null,
    "metadata": {},
    "name": "UserUsageReportViewMetricNamesQuery",
    "operationKind": "query",
    "text": "query UserUsageReportViewMetricNamesQuery {\n  container_utilization_metric_metadata {\n    metric_names\n  }\n}\n"
  }
};
})();

(node as any).hash = "78bea8f2236a67b91fe39cb4ed79c7b6";

export default node;

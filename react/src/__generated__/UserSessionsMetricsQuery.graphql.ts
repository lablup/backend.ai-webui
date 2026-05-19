/**
 * @generated SignedSource<<9fb6da497b3edb7bdcd4ff26c5acba62>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type UserSessionsMetricsQuery$variables = Record<PropertyKey, never>;
export type UserSessionsMetricsQuery$data = {
  readonly container_utilization_metric_metadata: {
    readonly metric_names: ReadonlyArray<string | null | undefined> | null | undefined;
  } | null | undefined;
};
export type UserSessionsMetricsQuery = {
  response: UserSessionsMetricsQuery$data;
  variables: UserSessionsMetricsQuery$variables;
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
    "name": "UserSessionsMetricsQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "UserSessionsMetricsQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "21560ceabb06c90e8704f9796db735f7",
    "id": null,
    "metadata": {},
    "name": "UserSessionsMetricsQuery",
    "operationKind": "query",
    "text": "query UserSessionsMetricsQuery {\n  container_utilization_metric_metadata {\n    metric_names\n  }\n}\n"
  }
};
})();

(node as any).hash = "9d7023ac80a345ed8f9823d881a345a4";

export default node;

/**
 * @generated SignedSource<<2ca3db46ac2aabaf8b4472031b5aa597>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type adminDefaultPresetsMetadataQuery$variables = Record<PropertyKey, never>;
export type adminDefaultPresetsMetadataQuery$data = {
  readonly container_utilization_metric_metadata: {
    readonly metric_names: ReadonlyArray<string | null | undefined> | null | undefined;
  } | null | undefined;
};
export type adminDefaultPresetsMetadataQuery = {
  response: adminDefaultPresetsMetadataQuery$data;
  variables: adminDefaultPresetsMetadataQuery$variables;
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
    "name": "adminDefaultPresetsMetadataQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "adminDefaultPresetsMetadataQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "f74120ea8059def4aaf4f9f3f2998ee9",
    "id": null,
    "metadata": {},
    "name": "adminDefaultPresetsMetadataQuery",
    "operationKind": "query",
    "text": "query adminDefaultPresetsMetadataQuery {\n  container_utilization_metric_metadata {\n    metric_names\n  }\n}\n"
  }
};
})();

(node as any).hash = "46a5a0fb1b9ba4e26ce6035bedc3f044";

export default node;

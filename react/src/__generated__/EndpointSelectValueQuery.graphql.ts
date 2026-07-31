/**
 * @generated SignedSource<<d374b8eb6a89c3622c5305b9cdf8d011>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type EndpointSelectValueQuery$variables = {
  endpoint_id: string;
};
export type EndpointSelectValueQuery$data = {
  readonly endpoint: {
    readonly endpoint_id: string;
    readonly name: string | null | undefined;
    readonly project: string | null | undefined;
    readonly url: string | null | undefined;
  } | null | undefined;
};
export type EndpointSelectValueQuery = {
  response: EndpointSelectValueQuery$data;
  variables: EndpointSelectValueQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "endpoint_id"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "endpoint_id",
    "variableName": "endpoint_id"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "endpoint_id",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "url",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "project",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "EndpointSelectValueQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "Endpoint",
        "kind": "LinkedField",
        "name": "endpoint",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "kind": "RequiredField",
            "field": (v3/*: any*/),
            "action": "NONE"
          },
          (v4/*: any*/),
          (v5/*: any*/)
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "EndpointSelectValueQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "Endpoint",
        "kind": "LinkedField",
        "name": "endpoint",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/),
          (v4/*: any*/),
          (v5/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "80fdc17cb4bce9d1f8f34fc07b0439f4",
    "id": null,
    "metadata": {},
    "name": "EndpointSelectValueQuery",
    "operationKind": "query",
    "text": "query EndpointSelectValueQuery(\n  $endpoint_id: UUID!\n) {\n  endpoint(endpoint_id: $endpoint_id) {\n    name\n    endpoint_id\n    url\n    project\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "2d842e86d1f299782140fa06bf6eb739";

export default node;

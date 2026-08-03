/**
 * @generated SignedSource<<32f151f4c8d125d585242479c525734b>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type DeploymentSelectValueQuery$variables = {
  endpoint_id: string;
};
export type DeploymentSelectValueQuery$data = {
  readonly endpoint: {
    readonly endpoint_id: string;
    readonly name: string | null | undefined;
    readonly url: string | null | undefined;
  } | null | undefined;
};
export type DeploymentSelectValueQuery = {
  response: DeploymentSelectValueQuery$data;
  variables: DeploymentSelectValueQuery$variables;
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
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "DeploymentSelectValueQuery",
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
          (v4/*: any*/)
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
    "name": "DeploymentSelectValueQuery",
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
    "cacheID": "d888e8ed8462de1a8cdfa5203eec275f",
    "id": null,
    "metadata": {},
    "name": "DeploymentSelectValueQuery",
    "operationKind": "query",
    "text": "query DeploymentSelectValueQuery(\n  $endpoint_id: UUID!\n) {\n  endpoint(endpoint_id: $endpoint_id) {\n    name\n    endpoint_id\n    url\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "94a10c16a1bb37157f0a417d80a9c5e2";

export default node;

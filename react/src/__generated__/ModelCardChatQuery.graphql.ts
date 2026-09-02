/**
 * @generated SignedSource<<bf5a4412fa0c54f7e7c934d1ab050d8c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ModelCardChatQuery$variables = {
  filter?: string | null | undefined;
  limit: number;
  offset: number;
  projectID?: string | null | undefined;
};
export type ModelCardChatQuery$data = {
  readonly endpoint_list: {
    readonly items: ReadonlyArray<{
      readonly endpoint_id: string | null | undefined;
      readonly model: string | null | undefined;
      readonly name: string | null | undefined;
      readonly status: string | null | undefined;
      readonly url: string | null | undefined;
    } | null | undefined>;
  } | null | undefined;
};
export type ModelCardChatQuery = {
  response: ModelCardChatQuery$data;
  variables: ModelCardChatQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "filter"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "limit"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "offset"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "projectID"
},
v4 = [
  {
    "kind": "Variable",
    "name": "filter",
    "variableName": "filter"
  },
  {
    "kind": "Variable",
    "name": "limit",
    "variableName": "limit"
  },
  {
    "kind": "Variable",
    "name": "offset",
    "variableName": "offset"
  },
  {
    "kind": "Variable",
    "name": "project",
    "variableName": "projectID"
  }
],
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "endpoint_id",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "url",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "model",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "status",
  "storageKey": null
};
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
    "name": "ModelCardChatQuery",
    "selections": [
      {
        "alias": null,
        "args": (v4/*: any*/),
        "concreteType": "EndpointList",
        "kind": "LinkedField",
        "name": "endpoint_list",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "Endpoint",
            "kind": "LinkedField",
            "name": "items",
            "plural": true,
            "selections": [
              (v5/*: any*/),
              (v6/*: any*/),
              (v7/*: any*/),
              (v8/*: any*/),
              (v9/*: any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v2/*: any*/),
      (v1/*: any*/),
      (v0/*: any*/),
      (v3/*: any*/)
    ],
    "kind": "Operation",
    "name": "ModelCardChatQuery",
    "selections": [
      {
        "alias": null,
        "args": (v4/*: any*/),
        "concreteType": "EndpointList",
        "kind": "LinkedField",
        "name": "endpoint_list",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "Endpoint",
            "kind": "LinkedField",
            "name": "items",
            "plural": true,
            "selections": [
              (v5/*: any*/),
              (v6/*: any*/),
              (v7/*: any*/),
              (v8/*: any*/),
              (v9/*: any*/),
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
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "7f93d7f70806e0f9f18d9666a2f2371d",
    "id": null,
    "metadata": {},
    "name": "ModelCardChatQuery",
    "operationKind": "query",
    "text": "query ModelCardChatQuery(\n  $offset: Int!\n  $limit: Int!\n  $filter: String\n  $projectID: UUID\n) {\n  endpoint_list(offset: $offset, limit: $limit, project: $projectID, filter: $filter) {\n    items {\n      name\n      endpoint_id\n      url\n      model\n      status\n      id\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "8a95664312d7453dcb21822258d9b915";

export default node;

/**
 * @generated SignedSource<<e94d001e737533dc578c9b4dd9af448a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type EndpointSelectQuery$variables = {
  filter?: string | null | undefined;
  limit: number;
  offset: number;
  projectID?: string | null | undefined;
};
export type EndpointSelectQuery$data = {
  readonly endpoint_list: {
    readonly items: ReadonlyArray<{
      readonly endpoint_id: string;
      readonly name: string | null | undefined;
      readonly url: string | null | undefined;
    } | null | undefined>;
    readonly total_count: number;
  } | null | undefined;
};
export type EndpointSelectQuery = {
  response: EndpointSelectQuery$data;
  variables: EndpointSelectQuery$variables;
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
  "name": "total_count",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "endpoint_id",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "url",
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
    "name": "EndpointSelectQuery",
    "selections": [
      {
        "alias": null,
        "args": (v4/*: any*/),
        "concreteType": "EndpointList",
        "kind": "LinkedField",
        "name": "endpoint_list",
        "plural": false,
        "selections": [
          (v5/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "Endpoint",
            "kind": "LinkedField",
            "name": "items",
            "plural": true,
            "selections": [
              (v6/*: any*/),
              {
                "kind": "RequiredField",
                "field": (v7/*: any*/),
                "action": "NONE"
              },
              (v8/*: any*/)
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
      (v3/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "EndpointSelectQuery",
    "selections": [
      {
        "alias": null,
        "args": (v4/*: any*/),
        "concreteType": "EndpointList",
        "kind": "LinkedField",
        "name": "endpoint_list",
        "plural": false,
        "selections": [
          (v5/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "Endpoint",
            "kind": "LinkedField",
            "name": "items",
            "plural": true,
            "selections": [
              (v6/*: any*/),
              (v7/*: any*/),
              (v8/*: any*/),
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
    "cacheID": "aae5f818f3d7f1a77dce26a43ed1ead6",
    "id": null,
    "metadata": {},
    "name": "EndpointSelectQuery",
    "operationKind": "query",
    "text": "query EndpointSelectQuery(\n  $offset: Int!\n  $limit: Int!\n  $projectID: UUID\n  $filter: String\n) {\n  endpoint_list(offset: $offset, limit: $limit, project: $projectID, filter: $filter) {\n    total_count\n    items {\n      name\n      endpoint_id\n      url\n      id\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "75cd9e15a8e37c564ec047492c6798b3";

export default node;

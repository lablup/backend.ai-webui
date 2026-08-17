/**
 * @generated SignedSource<<f80328b9307d52dcc8ed174406328d68>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type SessionResourceGridPrototypeQuery$variables = {
  filter?: string | null | undefined;
  group_id?: string | null | undefined;
  limit: number;
  offset: number;
  order?: string | null | undefined;
};
export type SessionResourceGridPrototypeQuery$data = {
  readonly compute_session_list: {
    readonly items: ReadonlyArray<{
      readonly cluster_mode: string | null | undefined;
      readonly cluster_size: number | null | undefined;
      readonly containers: ReadonlyArray<{
        readonly cluster_hostname: string | null | undefined;
        readonly cluster_role: string | null | undefined;
        readonly id: string | null | undefined;
        readonly live_stat: string | null | undefined;
        readonly status: string | null | undefined;
      } | null | undefined> | null | undefined;
      readonly created_at: string | null | undefined;
      readonly id: string | null | undefined;
      readonly image: string | null | undefined;
      readonly name: string | null | undefined;
      readonly occupied_slots: string | null | undefined;
      readonly requested_slots: string | null | undefined;
      readonly scaling_group: string | null | undefined;
      readonly session_id: string | null | undefined;
      readonly status: string | null | undefined;
      readonly type: string | null | undefined;
    } | null | undefined>;
    readonly total_count: number;
  } | null | undefined;
};
export type SessionResourceGridPrototypeQuery = {
  response: SessionResourceGridPrototypeQuery$data;
  variables: SessionResourceGridPrototypeQuery$variables;
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
  "name": "group_id"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "limit"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "offset"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "order"
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "status",
  "storageKey": null
},
v7 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "filter",
        "variableName": "filter"
      },
      {
        "kind": "Variable",
        "name": "group_id",
        "variableName": "group_id"
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
        "name": "order",
        "variableName": "order"
      }
    ],
    "concreteType": "ComputeSessionList",
    "kind": "LinkedField",
    "name": "compute_session_list",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "total_count",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "ComputeSession",
        "kind": "LinkedField",
        "name": "items",
        "plural": true,
        "selections": [
          (v5/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "session_id",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "name",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "type",
            "storageKey": null
          },
          (v6/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "image",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "created_at",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "cluster_mode",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "cluster_size",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "scaling_group",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "occupied_slots",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "requested_slots",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "ComputeContainer",
            "kind": "LinkedField",
            "name": "containers",
            "plural": true,
            "selections": [
              (v5/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "cluster_role",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "cluster_hostname",
                "storageKey": null
              },
              (v6/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "live_stat",
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/),
      (v4/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "SessionResourceGridPrototypeQuery",
    "selections": (v7/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v2/*: any*/),
      (v3/*: any*/),
      (v0/*: any*/),
      (v4/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Operation",
    "name": "SessionResourceGridPrototypeQuery",
    "selections": (v7/*: any*/)
  },
  "params": {
    "cacheID": "a4744e37166eea3510a0ae0bcc38a2ab",
    "id": null,
    "metadata": {},
    "name": "SessionResourceGridPrototypeQuery",
    "operationKind": "query",
    "text": "query SessionResourceGridPrototypeQuery(\n  $limit: Int!\n  $offset: Int!\n  $filter: String\n  $order: String\n  $group_id: String\n) {\n  compute_session_list(limit: $limit, offset: $offset, filter: $filter, order: $order, group_id: $group_id) {\n    total_count\n    items {\n      id\n      session_id\n      name\n      type\n      status\n      image\n      created_at\n      cluster_mode\n      cluster_size\n      scaling_group\n      occupied_slots\n      requested_slots\n      containers {\n        id\n        cluster_role\n        cluster_hostname\n        status\n        live_stat\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "48ef0853e65476c9afc4dea532ad919e";

export default node;

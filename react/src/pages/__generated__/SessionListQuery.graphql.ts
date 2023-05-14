/**
 * @generated SignedSource<<dea5ea28d0a554f3f3fde173dab3d7e5>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
export type SessionListQuery$variables = {
  ak?: string | null;
  group_id?: string | null;
  limit: number;
  offset: number;
  skipCodejong: boolean;
  status?: string | null;
};
export type SessionListQuery$data = {
  readonly compute_session_list: {
    readonly items: ReadonlyArray<{
      readonly codejong: string | null;
      readonly domain_name: string | null;
      readonly id: string | null;
      readonly name?: string | null;
    } | null>;
  } | null;
};
export type SessionListQuery = {
  response: SessionListQuery$data;
  variables: SessionListQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "ak"
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
  "name": "skipCodejong"
},
v5 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "status"
},
v6 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "access_key",
        "variableName": "ak"
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
        "name": "status",
        "variableName": "status"
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
        "concreteType": "ComputeSession",
        "kind": "LinkedField",
        "name": "items",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          },
          {
            "condition": "skipCodejong",
            "kind": "Condition",
            "passingValue": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "name",
                "storageKey": null
              }
            ]
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "domain_name",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "codejong",
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
      (v4/*: any*/),
      (v5/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "SessionListQuery",
    "selections": (v6/*: any*/),
    "type": "Queries",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v2/*: any*/),
      (v3/*: any*/),
      (v0/*: any*/),
      (v1/*: any*/),
      (v5/*: any*/),
      (v4/*: any*/)
    ],
    "kind": "Operation",
    "name": "SessionListQuery",
    "selections": (v6/*: any*/)
  },
  "params": {
    "cacheID": "6f1c806ee3e2ccfe633a53a7c8fe2862",
    "id": null,
    "metadata": {},
    "name": "SessionListQuery",
    "operationKind": "query",
    "text": "query SessionListQuery(\n  $limit: Int!\n  $offset: Int!\n  $ak: String\n  $group_id: String\n  $status: String\n  $skipCodejong: Boolean!\n) {\n  compute_session_list(limit: $limit, offset: $offset, access_key: $ak, group_id: $group_id, status: $status) {\n    items {\n      id\n      name @include(if: $skipCodejong)\n      domain_name\n      codejong\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "432b79bd1a1b898cf218d87be20b122b";

export default node;

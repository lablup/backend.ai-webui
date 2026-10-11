/**
 * @generated SignedSource<<d720418a21111e42fa4c61da760cb4b9>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type AgentSelectPaginatedQuery$variables = {
  filter?: string | null | undefined;
  limit: number;
  offset: number;
  scaling_group?: string | null | undefined;
  status?: string | null | undefined;
};
export type AgentSelectPaginatedQuery$data = {
  readonly agent_summary_list: {
    readonly items: ReadonlyArray<{
      readonly architecture: string | null | undefined;
      readonly available_slots: string | null | undefined;
      readonly id: string | null | undefined;
      readonly occupied_slots: string | null | undefined;
      readonly schedulable: boolean | null | undefined;
      readonly status: string | null | undefined;
    } | null | undefined>;
    readonly total_count: number;
  } | null | undefined;
};
export type AgentSelectPaginatedQuery = {
  response: AgentSelectPaginatedQuery$data;
  variables: AgentSelectPaginatedQuery$variables;
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
  "name": "scaling_group"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "status"
},
v5 = [
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
        "name": "scaling_group",
        "variableName": "scaling_group"
      },
      {
        "kind": "Variable",
        "name": "status",
        "variableName": "status"
      }
    ],
    "concreteType": "AgentSummaryList",
    "kind": "LinkedField",
    "name": "agent_summary_list",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "AgentSummary",
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
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "status",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "schedulable",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "available_slots",
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
            "name": "architecture",
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "total_count",
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
    "name": "AgentSelectPaginatedQuery",
    "selections": (v5/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v2/*: any*/),
      (v4/*: any*/),
      (v0/*: any*/),
      (v3/*: any*/)
    ],
    "kind": "Operation",
    "name": "AgentSelectPaginatedQuery",
    "selections": (v5/*: any*/)
  },
  "params": {
    "cacheID": "cc5ba14510d7795e96d248ab3d866222",
    "id": null,
    "metadata": {},
    "name": "AgentSelectPaginatedQuery",
    "operationKind": "query",
    "text": "query AgentSelectPaginatedQuery(\n  $limit: Int!\n  $offset: Int!\n  $status: String\n  $filter: String\n  $scaling_group: String\n) {\n  agent_summary_list(limit: $limit, offset: $offset, status: $status, filter: $filter, scaling_group: $scaling_group) {\n    items {\n      id\n      status\n      schedulable\n      available_slots\n      occupied_slots\n      architecture\n    }\n    total_count\n  }\n}\n"
  }
};
})();

(node as any).hash = "224c4328d7131a1087094f055cd19779";

export default node;

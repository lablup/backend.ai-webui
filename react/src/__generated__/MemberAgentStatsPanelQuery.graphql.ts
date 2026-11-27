/**
 * @generated SignedSource<<50dd42cd0012fa6993dd38f753094cde>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type MemberAgentStatsPanelQuery$variables = {
  filter?: string | null | undefined;
  limit: number;
};
export type MemberAgentStatsPanelQuery$data = {
  readonly agent_summary_list: {
    readonly items: ReadonlyArray<{
      readonly available_slots: string | null | undefined;
      readonly occupied_slots: string | null | undefined;
      readonly schedulable: boolean | null | undefined;
    } | null | undefined>;
    readonly total_count: number;
  } | null | undefined;
};
export type MemberAgentStatsPanelQuery = {
  response: MemberAgentStatsPanelQuery$data;
  variables: MemberAgentStatsPanelQuery$variables;
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
v2 = [
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
    "kind": "Literal",
    "name": "offset",
    "value": 0
  },
  {
    "kind": "Literal",
    "name": "status",
    "value": "ALIVE"
  }
],
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "schedulable",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "available_slots",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "occupied_slots",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "total_count",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "MemberAgentStatsPanelQuery",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
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
              (v3/*: any*/),
              (v4/*: any*/),
              (v5/*: any*/)
            ],
            "storageKey": null
          },
          (v6/*: any*/)
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
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "MemberAgentStatsPanelQuery",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
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
          },
          (v6/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "808cfc16de8863a9074c1bc0823b1b5b",
    "id": null,
    "metadata": {},
    "name": "MemberAgentStatsPanelQuery",
    "operationKind": "query",
    "text": "query MemberAgentStatsPanelQuery(\n  $limit: Int!\n  $filter: String\n) {\n  agent_summary_list(limit: $limit, offset: 0, status: \"ALIVE\", filter: $filter) {\n    items {\n      schedulable\n      available_slots\n      occupied_slots\n      id\n    }\n    total_count\n  }\n}\n"
  }
};
})();

(node as any).hash = "be3073611a10154565f2753e5fd9d6a6";

export default node;

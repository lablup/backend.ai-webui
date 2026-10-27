/**
 * @generated SignedSource<<dede0c9bcc6f2d3cb6cdc29948cf03c5>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type AgentsPanelQuery$variables = {
  first: number;
  offset: number;
};
export type AgentsPanelQuery$data = {
  readonly agents: {
    readonly count: number | null | undefined;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly container_count: number | null | undefined;
        readonly id: string;
        readonly " $fragmentSpreads": FragmentRefs<"BAIAgentTableFragment">;
      } | null | undefined;
    } | null | undefined>;
  } | null | undefined;
  readonly alive: {
    readonly count: number;
  } | null | undefined;
  readonly lost: {
    readonly count: number;
  } | null | undefined;
  readonly restarting: {
    readonly count: number;
  } | null | undefined;
  readonly terminated: {
    readonly count: number;
  } | null | undefined;
};
export type AgentsPanelQuery = {
  response: AgentsPanelQuery$data;
  variables: AgentsPanelQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "first"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "offset"
  }
],
v1 = {
  "kind": "Literal",
  "name": "limit",
  "value": 1
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "count",
  "storageKey": null
},
v3 = [
  (v2/*: any*/)
],
v4 = {
  "alias": "alive",
  "args": [
    {
      "kind": "Literal",
      "name": "filter",
      "value": {
        "status": {
          "equals": "ALIVE"
        }
      }
    },
    (v1/*: any*/)
  ],
  "concreteType": "AgentV2Connection",
  "kind": "LinkedField",
  "name": "agentsV2",
  "plural": false,
  "selections": (v3/*: any*/),
  "storageKey": "agentsV2(filter:{\"status\":{\"equals\":\"ALIVE\"}},limit:1)"
},
v5 = {
  "alias": "lost",
  "args": [
    {
      "kind": "Literal",
      "name": "filter",
      "value": {
        "status": {
          "equals": "LOST"
        }
      }
    },
    (v1/*: any*/)
  ],
  "concreteType": "AgentV2Connection",
  "kind": "LinkedField",
  "name": "agentsV2",
  "plural": false,
  "selections": (v3/*: any*/),
  "storageKey": "agentsV2(filter:{\"status\":{\"equals\":\"LOST\"}},limit:1)"
},
v6 = {
  "alias": "restarting",
  "args": [
    {
      "kind": "Literal",
      "name": "filter",
      "value": {
        "status": {
          "equals": "RESTARTING"
        }
      }
    },
    (v1/*: any*/)
  ],
  "concreteType": "AgentV2Connection",
  "kind": "LinkedField",
  "name": "agentsV2",
  "plural": false,
  "selections": (v3/*: any*/),
  "storageKey": "agentsV2(filter:{\"status\":{\"equals\":\"RESTARTING\"}},limit:1)"
},
v7 = {
  "alias": "terminated",
  "args": [
    {
      "kind": "Literal",
      "name": "filter",
      "value": {
        "status": {
          "equals": "TERMINATED"
        }
      }
    },
    (v1/*: any*/)
  ],
  "concreteType": "AgentV2Connection",
  "kind": "LinkedField",
  "name": "agentsV2",
  "plural": false,
  "selections": (v3/*: any*/),
  "storageKey": "agentsV2(filter:{\"status\":{\"equals\":\"TERMINATED\"}},limit:1)"
},
v8 = [
  {
    "kind": "Variable",
    "name": "first",
    "variableName": "first"
  },
  {
    "kind": "Variable",
    "name": "offset",
    "variableName": "offset"
  },
  {
    "kind": "Literal",
    "name": "order",
    "value": "status"
  }
],
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "container_count",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "AgentsPanelQuery",
    "selections": [
      (v4/*: any*/),
      (v5/*: any*/),
      (v6/*: any*/),
      (v7/*: any*/),
      {
        "alias": "agents",
        "args": (v8/*: any*/),
        "concreteType": "AgentConnection",
        "kind": "LinkedField",
        "name": "agent_nodes",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "AgentEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "AgentNode",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v9/*: any*/),
                  (v10/*: any*/),
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "BAIAgentTableFragment"
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
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "AgentsPanelQuery",
    "selections": [
      (v4/*: any*/),
      (v5/*: any*/),
      (v6/*: any*/),
      (v7/*: any*/),
      {
        "alias": "agents",
        "args": (v8/*: any*/),
        "concreteType": "AgentConnection",
        "kind": "LinkedField",
        "name": "agent_nodes",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "AgentEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "AgentNode",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v9/*: any*/),
                  (v10/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "row_id",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "addr",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "region",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "architecture",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "first_contact",
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
                    "name": "available_slots",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "live_stat",
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
                    "name": "scaling_group",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "compute_plugins",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "version",
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
                    "name": "lost_at",
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
    ]
  },
  "params": {
    "cacheID": "cdee5b06993d43ead140d9b68892441a",
    "id": null,
    "metadata": {},
    "name": "AgentsPanelQuery",
    "operationKind": "query",
    "text": "query AgentsPanelQuery(\n  $first: Int!\n  $offset: Int!\n) {\n  alive: agentsV2(filter: {status: {equals: ALIVE}}, limit: 1) {\n    count\n  }\n  lost: agentsV2(filter: {status: {equals: LOST}}, limit: 1) {\n    count\n  }\n  restarting: agentsV2(filter: {status: {equals: RESTARTING}}, limit: 1) {\n    count\n  }\n  terminated: agentsV2(filter: {status: {equals: TERMINATED}}, limit: 1) {\n    count\n  }\n  agents: agent_nodes(order: \"status\", first: $first, offset: $offset) {\n    count\n    edges {\n      node {\n        id\n        container_count\n        ...BAIAgentTableFragment\n      }\n    }\n  }\n}\n\nfragment BAIAgentTableFragment on AgentNode {\n  id\n  row_id\n  addr\n  region\n  architecture\n  first_contact\n  occupied_slots\n  available_slots\n  live_stat\n  status\n  scaling_group\n  compute_plugins\n  version\n  schedulable\n  lost_at\n}\n"
  }
};
})();

(node as any).hash = "a652df24a8376beeb15c297dc5793029";

export default node;

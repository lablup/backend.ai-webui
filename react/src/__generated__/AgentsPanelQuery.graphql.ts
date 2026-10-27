/**
 * @generated SignedSource<<ad69dfb41e7904919856c31c642e3faf>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type AgentStatusEnum = "ALIVE" | "LOST" | "RESTARTING" | "TERMINATED" | "%future added value";
export type AgentsPanelQuery$variables = {
  limit: number;
  offset: number;
};
export type AgentsPanelQuery$data = {
  readonly agents: {
    readonly count: number;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly containerCount: number | null | undefined;
        readonly id: string;
        readonly networkInfo: {
          readonly addr: string;
        };
        readonly scalingGroup: string;
        readonly statusInfo: {
          readonly schedulable: boolean;
          readonly status: AgentStatusEnum;
        };
      };
    }>;
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
    "name": "limit"
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
v4 = [
  {
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
  {
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
  {
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
  {
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
  {
    "alias": "agents",
    "args": [
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
        "kind": "Literal",
        "name": "orderBy",
        "value": [
          {
            "direction": "ASC",
            "field": "STATUS"
          },
          {
            "direction": "ASC",
            "field": "ID"
          }
        ]
      }
    ],
    "concreteType": "AgentV2Connection",
    "kind": "LinkedField",
    "name": "agentsV2",
    "plural": false,
    "selections": [
      (v2/*: any*/),
      {
        "alias": null,
        "args": null,
        "concreteType": "AgentV2Edge",
        "kind": "LinkedField",
        "name": "edges",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "AgentV2",
            "kind": "LinkedField",
            "name": "node",
            "plural": false,
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
                "name": "scalingGroup",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "containerCount",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "AgentNetworkInfo",
                "kind": "LinkedField",
                "name": "networkInfo",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "addr",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "AgentStatusInfo",
                "kind": "LinkedField",
                "name": "statusInfo",
                "plural": false,
                "selections": [
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
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "AgentsPanelQuery",
    "selections": (v4/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "AgentsPanelQuery",
    "selections": (v4/*: any*/)
  },
  "params": {
    "cacheID": "dc8b2db351e4bd55cdc184080aa32e15",
    "id": null,
    "metadata": {},
    "name": "AgentsPanelQuery",
    "operationKind": "query",
    "text": "query AgentsPanelQuery(\n  $limit: Int!\n  $offset: Int!\n) {\n  alive: agentsV2(filter: {status: {equals: ALIVE}}, limit: 1) {\n    count\n  }\n  lost: agentsV2(filter: {status: {equals: LOST}}, limit: 1) {\n    count\n  }\n  restarting: agentsV2(filter: {status: {equals: RESTARTING}}, limit: 1) {\n    count\n  }\n  terminated: agentsV2(filter: {status: {equals: TERMINATED}}, limit: 1) {\n    count\n  }\n  agents: agentsV2(orderBy: [{field: STATUS, direction: ASC}, {field: ID, direction: ASC}], limit: $limit, offset: $offset) {\n    count\n    edges {\n      node {\n        id\n        scalingGroup\n        containerCount\n        networkInfo {\n          addr\n        }\n        statusInfo {\n          status\n          schedulable\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "3350a4265cbe22d5a91be6c09df8c6d4";

export default node;

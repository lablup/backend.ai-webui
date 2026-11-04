/**
 * @generated SignedSource<<84eb393a02cf5c00e41131bbfc69de10>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type WebMCPAgentListToolsTestQuery$variables = Record<PropertyKey, never>;
export type WebMCPAgentListToolsTestQuery$data = {
  readonly agent_nodes: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly " $fragmentSpreads": FragmentRefs<"WebMCPAgentListToolsFragment">;
      } | null | undefined;
    } | null | undefined>;
  } | null | undefined;
};
export type WebMCPAgentListToolsTestQuery = {
  response: WebMCPAgentListToolsTestQuery$data;
  variables: WebMCPAgentListToolsTestQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 10
  }
],
v1 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "String"
},
v2 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "JSONString"
},
v3 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "DateTime"
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "WebMCPAgentListToolsTestQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": "AgentConnection",
        "kind": "LinkedField",
        "name": "agent_nodes",
        "plural": false,
        "selections": [
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
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "WebMCPAgentListToolsFragment"
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": "agent_nodes(first:10)"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "WebMCPAgentListToolsTestQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": "AgentConnection",
        "kind": "LinkedField",
        "name": "agent_nodes",
        "plural": false,
        "selections": [
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
                    "name": "version",
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
                    "name": "lost_at",
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
                    "name": "scaling_group",
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
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": "agent_nodes(first:10)"
      }
    ]
  },
  "params": {
    "cacheID": "4ac070f6d254b87feec621c57785d34a",
    "id": null,
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "agent_nodes": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "AgentConnection"
        },
        "agent_nodes.edges": {
          "enumValues": null,
          "nullable": false,
          "plural": true,
          "type": "AgentEdge"
        },
        "agent_nodes.edges.node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "AgentNode"
        },
        "agent_nodes.edges.node.addr": (v1/*: any*/),
        "agent_nodes.edges.node.architecture": (v1/*: any*/),
        "agent_nodes.edges.node.available_slots": (v2/*: any*/),
        "agent_nodes.edges.node.first_contact": (v3/*: any*/),
        "agent_nodes.edges.node.id": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ID"
        },
        "agent_nodes.edges.node.lost_at": (v3/*: any*/),
        "agent_nodes.edges.node.occupied_slots": (v2/*: any*/),
        "agent_nodes.edges.node.region": (v1/*: any*/),
        "agent_nodes.edges.node.row_id": (v1/*: any*/),
        "agent_nodes.edges.node.scaling_group": (v1/*: any*/),
        "agent_nodes.edges.node.schedulable": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Boolean"
        },
        "agent_nodes.edges.node.status": (v1/*: any*/),
        "agent_nodes.edges.node.version": (v1/*: any*/)
      }
    },
    "name": "WebMCPAgentListToolsTestQuery",
    "operationKind": "query",
    "text": "query WebMCPAgentListToolsTestQuery {\n  agent_nodes(first: 10) {\n    edges {\n      node {\n        ...WebMCPAgentListToolsFragment\n        id\n      }\n    }\n  }\n}\n\nfragment WebMCPAgentListToolsFragment on AgentNode {\n  id\n  row_id\n  addr\n  region\n  architecture\n  version\n  first_contact\n  lost_at\n  occupied_slots\n  available_slots\n  scaling_group\n  status\n  schedulable\n}\n"
  }
};
})();

(node as any).hash = "4c61a81c03264f80fefef6365d6c2f4e";

export default node;

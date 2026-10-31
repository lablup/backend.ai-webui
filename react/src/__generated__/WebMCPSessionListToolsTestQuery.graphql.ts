/**
 * @generated SignedSource<<a5220b9a74124005ff97f19589a2cad8>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type WebMCPSessionListToolsTestQuery$variables = Record<PropertyKey, never>;
export type WebMCPSessionListToolsTestQuery$data = {
  readonly compute_session_nodes: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly " $fragmentSpreads": FragmentRefs<"WebMCPSessionListToolsFragment">;
      } | null | undefined;
    } | null | undefined>;
  } | null | undefined;
};
export type WebMCPSessionListToolsTestQuery = {
  response: WebMCPSessionListToolsTestQuery$data;
  variables: WebMCPSessionListToolsTestQuery$variables;
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
  "type": "DateTime"
},
v2 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "String"
},
v3 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "UUID"
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "WebMCPSessionListToolsTestQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": "ComputeSessionConnection",
        "kind": "LinkedField",
        "name": "compute_session_nodes",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "ComputeSessionEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "ComputeSessionNode",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "WebMCPSessionListToolsFragment"
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": "compute_session_nodes(first:10)"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "WebMCPSessionListToolsTestQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": "ComputeSessionConnection",
        "kind": "LinkedField",
        "name": "compute_session_nodes",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "ComputeSessionEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "ComputeSessionNode",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
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
                    "name": "name",
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
                    "name": "status_info",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "result",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "type",
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
                    "name": "created_at",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "terminated_at",
                    "storageKey": null
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
                    "name": "project_id",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "agent_ids",
                    "storageKey": null
                  },
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
        ],
        "storageKey": "compute_session_nodes(first:10)"
      }
    ]
  },
  "params": {
    "cacheID": "55202356738b98c67f749cbfcaeb210d",
    "id": null,
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "compute_session_nodes": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "ComputeSessionConnection"
        },
        "compute_session_nodes.edges": {
          "enumValues": null,
          "nullable": false,
          "plural": true,
          "type": "ComputeSessionEdge"
        },
        "compute_session_nodes.edges.node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "ComputeSessionNode"
        },
        "compute_session_nodes.edges.node.agent_ids": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "String"
        },
        "compute_session_nodes.edges.node.created_at": (v1/*: any*/),
        "compute_session_nodes.edges.node.domain_name": (v2/*: any*/),
        "compute_session_nodes.edges.node.id": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ID"
        },
        "compute_session_nodes.edges.node.name": (v2/*: any*/),
        "compute_session_nodes.edges.node.project_id": (v3/*: any*/),
        "compute_session_nodes.edges.node.result": (v2/*: any*/),
        "compute_session_nodes.edges.node.row_id": (v3/*: any*/),
        "compute_session_nodes.edges.node.scaling_group": (v2/*: any*/),
        "compute_session_nodes.edges.node.status": (v2/*: any*/),
        "compute_session_nodes.edges.node.status_info": (v2/*: any*/),
        "compute_session_nodes.edges.node.terminated_at": (v1/*: any*/),
        "compute_session_nodes.edges.node.type": (v2/*: any*/)
      }
    },
    "name": "WebMCPSessionListToolsTestQuery",
    "operationKind": "query",
    "text": "query WebMCPSessionListToolsTestQuery {\n  compute_session_nodes(first: 10) {\n    edges {\n      node {\n        ...WebMCPSessionListToolsFragment\n        id\n      }\n    }\n  }\n}\n\nfragment WebMCPSessionListToolsFragment on ComputeSessionNode {\n  row_id\n  name\n  status\n  status_info\n  result\n  type\n  scaling_group\n  created_at\n  terminated_at\n  domain_name\n  project_id\n  agent_ids\n}\n"
  }
};
})();

(node as any).hash = "cdf61ee1d6c30fb4b2a26cd70d87eb71";

export default node;

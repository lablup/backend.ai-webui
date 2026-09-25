/**
 * @generated SignedSource<<145b6f6208d5e342ba44f7afe7120a21>>
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
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v2 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "DateTime"
},
v3 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "String"
},
v4 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "ID"
},
v5 = {
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
                    "concreteType": "UserNode",
                    "kind": "LinkedField",
                    "name": "owner",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "email",
                        "storageKey": null
                      },
                      (v1/*: any*/)
                    ],
                    "storageKey": null
                  },
                  (v1/*: any*/)
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
    "cacheID": "cf93dfd407cbcd138833a53b72ec39cb",
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
        "compute_session_nodes.edges.node.created_at": (v2/*: any*/),
        "compute_session_nodes.edges.node.domain_name": (v3/*: any*/),
        "compute_session_nodes.edges.node.id": (v4/*: any*/),
        "compute_session_nodes.edges.node.name": (v3/*: any*/),
        "compute_session_nodes.edges.node.owner": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "UserNode"
        },
        "compute_session_nodes.edges.node.owner.email": (v3/*: any*/),
        "compute_session_nodes.edges.node.owner.id": (v4/*: any*/),
        "compute_session_nodes.edges.node.project_id": (v5/*: any*/),
        "compute_session_nodes.edges.node.result": (v3/*: any*/),
        "compute_session_nodes.edges.node.row_id": (v5/*: any*/),
        "compute_session_nodes.edges.node.scaling_group": (v3/*: any*/),
        "compute_session_nodes.edges.node.status": (v3/*: any*/),
        "compute_session_nodes.edges.node.status_info": (v3/*: any*/),
        "compute_session_nodes.edges.node.terminated_at": (v2/*: any*/),
        "compute_session_nodes.edges.node.type": (v3/*: any*/)
      }
    },
    "name": "WebMCPSessionListToolsTestQuery",
    "operationKind": "query",
    "text": "query WebMCPSessionListToolsTestQuery {\n  compute_session_nodes(first: 10) {\n    edges {\n      node {\n        ...WebMCPSessionListToolsFragment\n        id\n      }\n    }\n  }\n}\n\nfragment WebMCPSessionListToolsFragment on ComputeSessionNode {\n  row_id\n  name\n  status\n  status_info\n  result\n  type\n  scaling_group\n  created_at\n  terminated_at\n  domain_name\n  project_id\n  agent_ids\n  owner @since(version: \"25.13.0\") {\n    email\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "cdf61ee1d6c30fb4b2a26cd70d87eb71";

export default node;

/**
 * @generated SignedSource<<b75cf60920e2bb6127b03636f6fa4bb2>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SessionStatusBadgeTestQuery$variables = {
  id: any;
};
export type SessionStatusBadgeTestQuery$data = {
  readonly compute_session_node: {
    readonly " $fragmentSpreads": FragmentRefs<"SessionStatusBadgeFragment">;
  } | null | undefined;
};
export type SessionStatusBadgeTestQuery = {
  response: SessionStatusBadgeTestQuery$data;
  variables: SessionStatusBadgeTestQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "status",
  "storageKey": null
},
v4 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "Int"
},
v5 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "ID"
},
v6 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "String"
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "SessionStatusBadgeTestQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "ComputeSessionNode",
        "kind": "LinkedField",
        "name": "compute_session_node",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "SessionStatusBadgeFragment"
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
    "name": "SessionStatusBadgeTestQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "ComputeSessionNode",
        "kind": "LinkedField",
        "name": "compute_session_node",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/),
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
            "name": "status_data",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "queue_position",
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
            "concreteType": "KernelConnection",
            "kind": "LinkedField",
            "name": "kernel_nodes",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "KernelEdge",
                "kind": "LinkedField",
                "name": "edges",
                "plural": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "KernelNode",
                    "kind": "LinkedField",
                    "name": "node",
                    "plural": false,
                    "selections": [
                      (v2/*: any*/),
                      (v3/*: any*/)
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
    ]
  },
  "params": {
    "cacheID": "37290f2a3b7805c830700bdc61b01e0f",
    "id": null,
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "compute_session_node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "ComputeSessionNode"
        },
        "compute_session_node.cluster_size": (v4/*: any*/),
        "compute_session_node.id": (v5/*: any*/),
        "compute_session_node.kernel_nodes": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "KernelConnection"
        },
        "compute_session_node.kernel_nodes.edges": {
          "enumValues": null,
          "nullable": false,
          "plural": true,
          "type": "KernelEdge"
        },
        "compute_session_node.kernel_nodes.edges.node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "KernelNode"
        },
        "compute_session_node.kernel_nodes.edges.node.id": (v5/*: any*/),
        "compute_session_node.kernel_nodes.edges.node.status": (v6/*: any*/),
        "compute_session_node.queue_position": (v4/*: any*/),
        "compute_session_node.status": (v6/*: any*/),
        "compute_session_node.status_data": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "JSONString"
        },
        "compute_session_node.status_info": (v6/*: any*/)
      }
    },
    "name": "SessionStatusBadgeTestQuery",
    "operationKind": "query",
    "text": "query SessionStatusBadgeTestQuery(\n  $id: GlobalIDField!\n) {\n  compute_session_node(id: $id) {\n    ...SessionStatusBadgeFragment\n    id\n  }\n}\n\nfragment SessionStatusBadgeFragment on ComputeSessionNode {\n  id\n  status\n  status_info\n  status_data\n  queue_position @since(version: \"25.13.0\")\n  cluster_size\n  kernel_nodes {\n    edges {\n      node {\n        id\n        status\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "b6291e0c9e25e989d89a6dd9d0e7bc1a";

export default node;

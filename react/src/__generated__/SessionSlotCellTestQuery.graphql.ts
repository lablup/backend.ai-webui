/**
 * @generated SignedSource<<2689aeb8cd0bdd162ad072b982264685>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SessionSlotCellTestQuery$variables = {
  id: any;
};
export type SessionSlotCellTestQuery$data = {
  readonly compute_session_node: {
    readonly " $fragmentSpreads": FragmentRefs<"SessionSlotCellFragment">;
  } | null | undefined;
};
export type SessionSlotCellTestQuery = {
  response: SessionSlotCellTestQuery$data;
  variables: SessionSlotCellTestQuery$variables;
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
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "ID"
},
v4 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "String"
},
v5 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "JSONString"
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "SessionSlotCellTestQuery",
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
            "name": "SessionSlotCellFragment"
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
    "name": "SessionSlotCellTestQuery",
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
            "kind": "ScalarField",
            "name": "tag",
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
                        "name": "cluster_role",
                        "storageKey": null
                      },
                      (v2/*: any*/)
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
    "cacheID": "bd273390b436a0a8c0ccec931fb1364a",
    "id": null,
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "compute_session_node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "ComputeSessionNode"
        },
        "compute_session_node.id": (v3/*: any*/),
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
        "compute_session_node.kernel_nodes.edges.node.cluster_role": (v4/*: any*/),
        "compute_session_node.kernel_nodes.edges.node.id": (v3/*: any*/),
        "compute_session_node.kernel_nodes.edges.node.live_stat": (v5/*: any*/),
        "compute_session_node.occupied_slots": (v5/*: any*/),
        "compute_session_node.requested_slots": (v5/*: any*/),
        "compute_session_node.status": (v4/*: any*/),
        "compute_session_node.tag": (v4/*: any*/)
      }
    },
    "name": "SessionSlotCellTestQuery",
    "operationKind": "query",
    "text": "query SessionSlotCellTestQuery(\n  $id: GlobalIDField!\n) {\n  compute_session_node(id: $id) {\n    ...SessionSlotCellFragment\n    id\n  }\n}\n\nfragment SessionSlotCellFragment on ComputeSessionNode {\n  id\n  status\n  occupied_slots\n  requested_slots\n  tag\n  ...useSessionNodeLiveStatSessionFragment\n}\n\nfragment useSessionNodeLiveStatSessionFragment on ComputeSessionNode {\n  id\n  kernel_nodes {\n    edges {\n      node {\n        live_stat\n        cluster_role\n        id\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "36f5306cc3c1ce6d3ae6fd38a3333f61";

export default node;

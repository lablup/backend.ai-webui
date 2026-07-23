/**
 * @generated SignedSource<<e8f6805e6c4612c2b7daf480f7b259ae>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ContainerLogModalWithLazyQueryLoaderQuery$variables = {
  sessionId: any;
};
export type ContainerLogModalWithLazyQueryLoaderQuery$data = {
  readonly compute_session_node: {
    readonly " $fragmentSpreads": FragmentRefs<"ContainerLogModalFragment">;
  } | null | undefined;
};
export type ContainerLogModalWithLazyQueryLoaderQuery = {
  response: ContainerLogModalWithLazyQueryLoaderQuery$data;
  variables: ContainerLogModalWithLazyQueryLoaderQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "sessionId"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "sessionId"
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
  "name": "row_id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "ContainerLogModalWithLazyQueryLoaderQuery",
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
            "name": "ContainerLogModalFragment"
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
    "name": "ContainerLogModalWithLazyQueryLoaderQuery",
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
            "name": "access_key",
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
                      (v3/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "container_id",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "cluster_idx",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "cluster_role",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "cluster_hostname",
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
    ]
  },
  "params": {
    "cacheID": "89fc3e7f92ccd61c1a3e682390072ccb",
    "id": null,
    "metadata": {},
    "name": "ContainerLogModalWithLazyQueryLoaderQuery",
    "operationKind": "query",
    "text": "query ContainerLogModalWithLazyQueryLoaderQuery(\n  $sessionId: GlobalIDField!\n) {\n  compute_session_node(id: $sessionId) {\n    ...ContainerLogModalFragment\n    id\n  }\n}\n\nfragment ContainerLogModalFragment on ComputeSessionNode {\n  id\n  row_id\n  name\n  status\n  access_key\n  kernel_nodes {\n    edges {\n      node {\n        id\n        row_id\n        container_id\n        cluster_idx\n        cluster_role\n        cluster_hostname\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "5e3c1a9c71ef2548c32579df194e26ee";

export default node;

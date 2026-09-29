/**
 * @generated SignedSource<<af01119beadae00cacdb609162d82bbc>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BAIComputeSessionNodeNotificationItemSubscription$variables = {
  session_id: string;
};
export type BAIComputeSessionNodeNotificationItemSubscription$data = {
  readonly schedulingEventsBySession: {
    readonly reason: string;
    readonly session: {
      readonly agent_ids: ReadonlyArray<string | null | undefined> | null | undefined;
      readonly commit_status: string | null | undefined;
      readonly created_at: string | null | undefined;
      readonly idle_checks: string | null | undefined;
      readonly kernel_nodes: {
        readonly edges: ReadonlyArray<{
          readonly node: {
            readonly agent_id: string | null | undefined;
            readonly cluster_hostname: string | null | undefined;
            readonly cluster_idx: number | null | undefined;
            readonly cluster_role: string | null | undefined;
            readonly container_id: string | null | undefined;
            readonly image: {
              readonly " $fragmentSpreads": FragmentRefs<"BAIImageNodeSimpleTagFragment">;
            } | null | undefined;
            readonly row_id: string | null | undefined;
            readonly status: string | null | undefined;
            readonly status_info: string | null | undefined;
          } | null | undefined;
        } | null | undefined>;
      } | null | undefined;
      readonly occupied_slots: string | null | undefined;
      readonly queue_position: number | null | undefined;
      readonly result: string | null | undefined;
      readonly service_ports: string | null | undefined;
      readonly starts_at: string | null | undefined;
      readonly status: string | null | undefined;
      readonly status_data: string | null | undefined;
      readonly status_info: string | null | undefined;
      readonly terminated_at: string | null | undefined;
    } | null | undefined;
  };
};
export type BAIComputeSessionNodeNotificationItemSubscription = {
  response: BAIComputeSessionNodeNotificationItemSubscription$data;
  variables: BAIComputeSessionNodeNotificationItemSubscription$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "session_id"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "sessionId",
    "variableName": "session_id"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "reason",
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
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "status_info",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "status_data",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "result",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "service_ports",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "commit_status",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "agent_ids",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "occupied_slots",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "created_at",
  "storageKey": null
},
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "starts_at",
  "storageKey": null
},
v13 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "terminated_at",
  "storageKey": null
},
v14 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "queue_position",
  "storageKey": null
},
v15 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "idle_checks",
  "storageKey": null
},
v16 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "agent_id",
  "storageKey": null
},
v17 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "container_id",
  "storageKey": null
},
v18 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "row_id",
  "storageKey": null
},
v19 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "cluster_role",
  "storageKey": null
},
v20 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "cluster_idx",
  "storageKey": null
},
v21 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "cluster_hostname",
  "storageKey": null
},
v22 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "key",
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "value",
    "storageKey": null
  }
],
v23 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "BAIComputeSessionNodeNotificationItemSubscription",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "SchedulingBroadcastEventPayload",
        "kind": "LinkedField",
        "name": "schedulingEventsBySession",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "ComputeSessionNode",
            "kind": "LinkedField",
            "name": "session",
            "plural": false,
            "selections": [
              (v3/*: any*/),
              (v4/*: any*/),
              (v5/*: any*/),
              (v6/*: any*/),
              (v7/*: any*/),
              (v8/*: any*/),
              (v9/*: any*/),
              (v10/*: any*/),
              (v11/*: any*/),
              (v12/*: any*/),
              (v13/*: any*/),
              (v14/*: any*/),
              (v15/*: any*/),
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
                          (v3/*: any*/),
                          (v4/*: any*/),
                          (v16/*: any*/),
                          (v17/*: any*/),
                          (v18/*: any*/),
                          (v19/*: any*/),
                          (v20/*: any*/),
                          (v21/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "ImageNode",
                            "kind": "LinkedField",
                            "name": "image",
                            "plural": false,
                            "selections": [
                              {
                                "args": null,
                                "kind": "FragmentSpread",
                                "name": "BAIImageNodeSimpleTagFragment"
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
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Subscription",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "BAIComputeSessionNodeNotificationItemSubscription",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "SchedulingBroadcastEventPayload",
        "kind": "LinkedField",
        "name": "schedulingEventsBySession",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "ComputeSessionNode",
            "kind": "LinkedField",
            "name": "session",
            "plural": false,
            "selections": [
              (v3/*: any*/),
              (v4/*: any*/),
              (v5/*: any*/),
              (v6/*: any*/),
              (v7/*: any*/),
              (v8/*: any*/),
              (v9/*: any*/),
              (v10/*: any*/),
              (v11/*: any*/),
              (v12/*: any*/),
              (v13/*: any*/),
              (v14/*: any*/),
              (v15/*: any*/),
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
                          (v3/*: any*/),
                          (v4/*: any*/),
                          (v16/*: any*/),
                          (v17/*: any*/),
                          (v18/*: any*/),
                          (v19/*: any*/),
                          (v20/*: any*/),
                          (v21/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "ImageNode",
                            "kind": "LinkedField",
                            "name": "image",
                            "plural": false,
                            "selections": [
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "base_image_name",
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
                                "name": "architecture",
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": "KVPair",
                                "kind": "LinkedField",
                                "name": "tags",
                                "plural": true,
                                "selections": (v22/*: any*/),
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": "KVPair",
                                "kind": "LinkedField",
                                "name": "labels",
                                "plural": true,
                                "selections": (v22/*: any*/),
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "registry",
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "namespace",
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "tag",
                                "storageKey": null
                              },
                              (v23/*: any*/)
                            ],
                            "storageKey": null
                          },
                          (v23/*: any*/)
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              (v23/*: any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "5c7c80f39ca3febd9ec8265e3b7ee651",
    "id": null,
    "metadata": {},
    "name": "BAIComputeSessionNodeNotificationItemSubscription",
    "operationKind": "subscription",
    "text": "subscription BAIComputeSessionNodeNotificationItemSubscription(\n  $session_id: ID!\n) {\n  schedulingEventsBySession(sessionId: $session_id) {\n    reason\n    session {\n      status\n      status_info\n      status_data\n      result\n      service_ports\n      commit_status\n      agent_ids\n      occupied_slots\n      created_at\n      starts_at\n      terminated_at\n      queue_position\n      idle_checks\n      kernel_nodes {\n        edges {\n          node {\n            status\n            status_info\n            agent_id\n            container_id\n            row_id\n            cluster_role\n            cluster_idx\n            cluster_hostname\n            image {\n              ...BAIImageNodeSimpleTagFragment\n              id\n            }\n            id\n          }\n        }\n      }\n      id\n    }\n  }\n}\n\nfragment BAIImageNodeSimpleTagFragment on ImageNode {\n  base_image_name\n  version\n  architecture\n  tags {\n    key\n    value\n  }\n  labels {\n    key\n    value\n  }\n  registry\n  namespace\n  tag\n}\n"
  }
};
})();

(node as any).hash = "f7b622d732889064edeaa6be25551f0d";

export default node;

/**
 * @generated SignedSource<<77ec75e74316c526b62ffe0403cc529c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ResourcesAstryxProbeAgentQuery$variables = {
  after?: string | null | undefined;
  before?: string | null | undefined;
  filter?: string | null | undefined;
  first?: number | null | undefined;
  last?: number | null | undefined;
  offset?: number | null | undefined;
  order?: string | null | undefined;
};
export type ResourcesAstryxProbeAgentQuery$data = {
  readonly agent_nodes: {
    readonly count: number | null | undefined;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly " $fragmentSpreads": FragmentRefs<"AgentDetailDrawerFragment">;
      } | null | undefined;
    } | null | undefined>;
  } | null | undefined;
};
export type ResourcesAstryxProbeAgentQuery = {
  response: ResourcesAstryxProbeAgentQuery$data;
  variables: ResourcesAstryxProbeAgentQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "after"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "before"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "filter"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "first"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "last"
},
v5 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "offset"
},
v6 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "order"
},
v7 = [
  {
    "kind": "Variable",
    "name": "after",
    "variableName": "after"
  },
  {
    "kind": "Variable",
    "name": "before",
    "variableName": "before"
  },
  {
    "kind": "Variable",
    "name": "filter",
    "variableName": "filter"
  },
  {
    "kind": "Variable",
    "name": "first",
    "variableName": "first"
  },
  {
    "kind": "Variable",
    "name": "last",
    "variableName": "last"
  },
  {
    "kind": "Variable",
    "name": "offset",
    "variableName": "offset"
  },
  {
    "kind": "Variable",
    "name": "order",
    "variableName": "order"
  }
],
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "count",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/),
      (v4/*: any*/),
      (v5/*: any*/),
      (v6/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "ResourcesAstryxProbeAgentQuery",
    "selections": [
      {
        "alias": null,
        "args": (v7/*: any*/),
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
                  (v8/*: any*/),
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "AgentDetailDrawerFragment"
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          (v9/*: any*/)
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
      (v2/*: any*/),
      (v6/*: any*/),
      (v5/*: any*/),
      (v3/*: any*/),
      (v1/*: any*/),
      (v0/*: any*/),
      (v4/*: any*/)
    ],
    "kind": "Operation",
    "name": "ResourcesAstryxProbeAgentQuery",
    "selections": [
      {
        "alias": null,
        "args": (v7/*: any*/),
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
                  (v8/*: any*/),
                  {
                    "kind": "InlineFragment",
                    "selections": [
                      {
                        "kind": "InlineFragment",
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
                            "name": "addr",
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
                            "name": "status_changed",
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
                            "name": "first_contact",
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
                            "name": "scaling_group",
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
                            "name": "compute_plugins",
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
                            "name": "occupied_slots",
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
                            "name": "gpu_alloc_map",
                            "storageKey": null
                          }
                        ],
                        "type": "AgentNode",
                        "abstractKey": null
                      }
                    ],
                    "type": "Node",
                    "abstractKey": "__isNode"
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          (v9/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "5062d00c24fb0046c5727aa256ba1815",
    "id": null,
    "metadata": {},
    "name": "ResourcesAstryxProbeAgentQuery",
    "operationKind": "query",
    "text": "query ResourcesAstryxProbeAgentQuery(\n  $filter: String\n  $order: String\n  $offset: Int\n  $first: Int\n  $before: String\n  $after: String\n  $last: Int\n) {\n  agent_nodes(filter: $filter, order: $order, offset: $offset, first: $first, after: $after, before: $before, last: $last) {\n    edges {\n      node {\n        id\n        ...AgentDetailDrawerFragment\n      }\n    }\n    count\n  }\n}\n\nfragment AgentActionButtonsFragment on AgentNode {\n  status\n  ...AgentSettingModalFragment\n  ...AgentLifeCycleControlModalFragment\n}\n\nfragment AgentComputePluginsFragment on AgentNode {\n  compute_plugins\n  available_slots\n}\n\nfragment AgentDetailDrawerContentFragment on AgentNode {\n  id\n  row_id\n  addr\n  status\n  status_changed\n  schedulable\n  first_contact\n  region\n  scaling_group\n  ...AgentStatusTagFragment\n  ...AgentComputePluginsFragment\n  ...AgentResourcesFragment\n  ...AgentActionButtonsFragment\n}\n\nfragment AgentDetailDrawerFragment on Node {\n  __isNode: __typename\n  ... on AgentNode {\n    id\n    ...AgentDetailDrawerContentFragment\n  }\n  id\n}\n\nfragment AgentDetailModalFragment on AgentNode {\n  id\n  live_stat\n  available_slots\n  occupied_slots\n}\n\nfragment AgentLifeCycleControlModalFragment on AgentNode {\n  id\n  status\n  status_changed\n}\n\nfragment AgentResourcesFragment on AgentNode {\n  occupied_slots\n  available_slots\n  live_stat\n  gpu_alloc_map\n  ...AgentDetailModalFragment\n}\n\nfragment AgentSettingModalFragment on AgentNode {\n  id\n  scaling_group\n  schedulable\n}\n\nfragment AgentStatusTagFragment on AgentNode {\n  status\n  status_changed\n  version\n}\n"
  }
};
})();

(node as any).hash = "b0ad8250a4b0920b9739bd0d6fc39d71";

export default node;

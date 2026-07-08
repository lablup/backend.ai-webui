/**
 * @generated SignedSource<<cc374ecfb8ce75e2375f58b9af2d9d61>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type AgentListQuery$variables = {
  after?: string | null | undefined;
  before?: string | null | undefined;
  filter?: string | null | undefined;
  first?: number | null | undefined;
  last?: number | null | undefined;
  offset?: number | null | undefined;
  order?: string | null | undefined;
};
export type AgentListQuery$data = {
  readonly agent_nodes: {
    readonly count: number | null | undefined;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly " $fragmentSpreads": FragmentRefs<"AgentDetailDrawerFragment" | "AgentDetailModalFragment" | "BAIAgentTableFragment">;
      } | null | undefined;
    } | null | undefined>;
  } | null | undefined;
};
export type AgentListQuery = {
  response: AgentListQuery$data;
  variables: AgentListQuery$variables;
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
    "name": "AgentListQuery",
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
                    "name": "BAIAgentTableFragment"
                  },
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "AgentDetailModalFragment"
                  },
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
    "name": "AgentListQuery",
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
                    "kind": "InlineFragment",
                    "selections": [
                      {
                        "kind": "InlineFragment",
                        "selections": [
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
    "cacheID": "270315af555a2a571b3752e262844b0f",
    "id": null,
    "metadata": {},
    "name": "AgentListQuery",
    "operationKind": "query",
    "text": "query AgentListQuery(\n  $filter: String\n  $order: String\n  $offset: Int\n  $first: Int\n  $before: String\n  $after: String\n  $last: Int\n) {\n  agent_nodes(filter: $filter, order: $order, offset: $offset, first: $first, after: $after, before: $before, last: $last) {\n    edges {\n      node {\n        id\n        ...BAIAgentTableFragment\n        ...AgentDetailModalFragment\n        ...AgentDetailDrawerFragment\n      }\n    }\n    count\n  }\n}\n\nfragment AgentActionButtonsFragment on AgentNode {\n  status\n  ...AgentSettingModalFragment\n  ...AgentLifeCycleControlModalFragment\n}\n\nfragment AgentComputePluginsFragment on AgentNode {\n  compute_plugins\n  available_slots\n}\n\nfragment AgentDetailDrawerContentFragment on AgentNode {\n  id\n  row_id\n  addr\n  status\n  status_changed\n  schedulable\n  first_contact\n  region\n  scaling_group\n  ...AgentStatusTagFragment\n  ...AgentComputePluginsFragment\n  ...AgentResourcesFragment\n  ...AgentActionButtonsFragment\n}\n\nfragment AgentDetailDrawerFragment on Node {\n  __isNode: __typename\n  ... on AgentNode {\n    id\n    ...AgentDetailDrawerContentFragment\n  }\n  id\n}\n\nfragment AgentDetailModalFragment on AgentNode {\n  id\n  live_stat\n  available_slots\n  occupied_slots\n}\n\nfragment AgentLifeCycleControlModalFragment on AgentNode {\n  id\n  status\n  status_changed\n}\n\nfragment AgentResourcesFragment on AgentNode {\n  occupied_slots\n  available_slots\n  live_stat\n  gpu_alloc_map\n  ...AgentDetailModalFragment\n}\n\nfragment AgentSettingModalFragment on AgentNode {\n  id\n  scaling_group\n  schedulable\n}\n\nfragment AgentStatusTagFragment on AgentNode {\n  status\n  status_changed\n  version\n}\n\nfragment BAIAgentTableFragment on AgentNode {\n  id\n  row_id\n  addr\n  region\n  architecture\n  first_contact\n  occupied_slots\n  available_slots\n  live_stat\n  status\n  scaling_group\n  compute_plugins\n  version\n  schedulable\n}\n"
  }
};
})();

(node as any).hash = "704a2d36c0fc813bd9e20af19b2e57ae";

export default node;

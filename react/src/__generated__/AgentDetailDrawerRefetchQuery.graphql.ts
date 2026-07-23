/**
 * @generated SignedSource<<d12fd86d58ff30624ff8c6f76da3beff>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type AgentDetailDrawerRefetchQuery$variables = {
  id: string;
};
export type AgentDetailDrawerRefetchQuery$data = {
  readonly node: {
    readonly " $fragmentSpreads": FragmentRefs<"AgentDetailDrawerFragment">;
  } | null | undefined;
};
export type AgentDetailDrawerRefetchQuery = {
  response: AgentDetailDrawerRefetchQuery$data;
  variables: AgentDetailDrawerRefetchQuery$variables;
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
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "AgentDetailDrawerRefetchQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "AgentDetailDrawerFragment"
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
    "name": "AgentDetailDrawerRefetchQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "__typename",
            "storageKey": null
          },
          {
            "kind": "TypeDiscriminator",
            "abstractKey": "__isNode"
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          },
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
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "c92fdf309bc05395cc32eba29156c120",
    "id": null,
    "metadata": {},
    "name": "AgentDetailDrawerRefetchQuery",
    "operationKind": "query",
    "text": "query AgentDetailDrawerRefetchQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...AgentDetailDrawerFragment\n    id\n  }\n}\n\nfragment AgentActionButtonsFragment on AgentNode {\n  status\n  ...AgentSettingModalFragment\n  ...AgentLifeCycleControlModalFragment\n}\n\nfragment AgentComputePluginsFragment on AgentNode {\n  compute_plugins\n  available_slots\n}\n\nfragment AgentDetailDrawerContentFragment on AgentNode {\n  id\n  row_id\n  addr\n  status\n  status_changed\n  schedulable\n  first_contact\n  region\n  scaling_group\n  ...AgentStatusTagFragment\n  ...AgentComputePluginsFragment\n  ...AgentResourcesFragment\n  ...AgentActionButtonsFragment\n}\n\nfragment AgentDetailDrawerFragment on Node {\n  __isNode: __typename\n  ... on AgentNode {\n    id\n    ...AgentDetailDrawerContentFragment\n  }\n  id\n}\n\nfragment AgentDetailModalFragment on AgentNode {\n  id\n  live_stat\n  available_slots\n  occupied_slots\n}\n\nfragment AgentLifeCycleControlModalFragment on AgentNode {\n  id\n  status\n  status_changed\n}\n\nfragment AgentResourcesFragment on AgentNode {\n  occupied_slots\n  available_slots\n  live_stat\n  gpu_alloc_map\n  ...AgentDetailModalFragment\n}\n\nfragment AgentSettingModalFragment on AgentNode {\n  id\n  scaling_group\n  schedulable\n}\n\nfragment AgentStatusTagFragment on AgentNode {\n  status\n  status_changed\n  version\n}\n"
  }
};
})();

(node as any).hash = "6bfcaf0b862ffeebe6e42667e683e1a2";

export default node;

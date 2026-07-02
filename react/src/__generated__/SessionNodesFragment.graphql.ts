/**
 * @generated SignedSource<<dc2ae1604e606bf57d081f8d643471b3>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SessionNodesFragment$data = ReadonlyArray<{
  readonly agent_ids: ReadonlyArray<string | null | undefined> | null | undefined;
  readonly created_at: string | null | undefined;
  readonly dependees: {
    readonly count: number | null | undefined;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly name: string | null | undefined;
        readonly row_id: string | null | undefined;
      } | null | undefined;
    } | null | undefined>;
  } | null | undefined;
  readonly dependents: {
    readonly count: number | null | undefined;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly name: string | null | undefined;
        readonly row_id: string | null | undefined;
      } | null | undefined;
    } | null | undefined>;
  } | null | undefined;
  readonly id: string;
  readonly kernel_nodes: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly image: {
          readonly " $fragmentSpreads": FragmentRefs<"ImageNodeSimpleTagFragment">;
        } | null | undefined;
      } | null | undefined;
    } | null | undefined>;
  } | null | undefined;
  readonly name: string | null | undefined;
  readonly owner: {
    readonly email: string | null | undefined;
  } | null | undefined;
  readonly project_id: string | null | undefined;
  readonly row_id: string;
  readonly scaling_group: string | null | undefined;
  readonly service_ports: string | null | undefined;
  readonly status: string | null | undefined;
  readonly type: string | null | undefined;
  readonly user_id: string | null | undefined;
  readonly " $fragmentSpreads": FragmentRefs<"AppLauncherModalFragment" | "BAISessionAgentIdsFragment" | "BAISessionClusterModeFragment" | "BAISessionTypeTagFragment" | "EditableSessionPriorityFragment" | "SessionDetailDrawerFragment" | "SessionReservationFragment" | "SessionSlotCellFragment" | "SessionStatusTagFragment" | "SessionUsageMonitorFragment" | "TerminateSessionModalFragment">;
  readonly " $fragmentType": "SessionNodesFragment";
} | null | undefined>;
export type SessionNodesFragment$key = ReadonlyArray<{
  readonly " $data"?: SessionNodesFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"SessionNodesFragment">;
}>;

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "row_id",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v2 = [
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
          (v0/*: any*/),
          (v1/*: any*/)
        ],
        "storageKey": null
      }
    ],
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "count",
    "storageKey": null
  }
];
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "SessionNodesFragment",
  "selections": [
    {
      "kind": "RequiredField",
      "field": {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "id",
        "storageKey": null
      },
      "action": "NONE"
    },
    {
      "kind": "RequiredField",
      "field": (v0/*: any*/),
      "action": "NONE"
    },
    (v1/*: any*/),
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
      "name": "type",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "service_ports",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "user_id",
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
      "args": null,
      "kind": "FragmentSpread",
      "name": "SessionStatusTagFragment"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "SessionReservationFragment"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "SessionSlotCellFragment"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "SessionUsageMonitorFragment"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "SessionDetailDrawerFragment"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "BAISessionAgentIdsFragment"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "BAISessionTypeTagFragment"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "BAISessionClusterModeFragment"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "AppLauncherModalFragment"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "TerminateSessionModalFragment"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "EditableSessionPriorityFragment"
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
                  "concreteType": "ImageNode",
                  "kind": "LinkedField",
                  "name": "image",
                  "plural": false,
                  "selections": [
                    {
                      "args": null,
                      "kind": "FragmentSpread",
                      "name": "ImageNodeSimpleTagFragment"
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
      "name": "scaling_group",
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
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "ComputeSessionConnection",
      "kind": "LinkedField",
      "name": "dependees",
      "plural": false,
      "selections": (v2/*: any*/),
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "ComputeSessionConnection",
      "kind": "LinkedField",
      "name": "dependents",
      "plural": false,
      "selections": (v2/*: any*/),
      "storageKey": null
    }
  ],
  "type": "ComputeSessionNode",
  "abstractKey": null
};
})();

(node as any).hash = "acaad3ed93922a4f630180db4e4ba967";

export default node;

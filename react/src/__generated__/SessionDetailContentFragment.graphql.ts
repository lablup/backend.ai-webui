/**
 * @generated SignedSource<<62c2a953cd829bbd8b9f20106ec915f0>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SessionDetailContentFragment$data = {
  readonly agent_ids: ReadonlyArray<string | null | undefined> | null | undefined;
  readonly created_at: string;
  readonly dependees: {
    readonly count: number | null | undefined;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly name: string | null | undefined;
        readonly row_id: string | null | undefined;
        readonly status: string | null | undefined;
      } | null | undefined;
    } | null | undefined>;
  } | null | undefined;
  readonly dependents: {
    readonly count: number | null | undefined;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly name: string | null | undefined;
        readonly row_id: string | null | undefined;
        readonly status: string | null | undefined;
      } | null | undefined;
    } | null | undefined>;
  } | null | undefined;
  readonly id: string;
  readonly idle_checks: string | null | undefined;
  readonly kernel_nodes: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly image: {
          readonly " $fragmentSpreads": FragmentRefs<"ImageNodeSimpleTagFragment">;
        } | null | undefined;
        readonly " $fragmentSpreads": FragmentRefs<"ConnectedKernelListFragment">;
      } | null | undefined;
    } | null | undefined>;
  } | null | undefined;
  readonly name: string | null | undefined;
  readonly occupied_slots: string | null | undefined;
  readonly owner: {
    readonly email: string | null | undefined;
  } | null | undefined;
  readonly project_id: string | null | undefined;
  readonly requested_slots: string | null | undefined;
  readonly resource_opts: string | null | undefined;
  readonly row_id: string | null | undefined;
  readonly scaling_group: string | null | undefined;
  readonly startup_command: string | null | undefined;
  readonly status: string | null | undefined;
  readonly status_data: string | null | undefined;
  readonly tag: string | null | undefined;
  readonly terminated_at: string | null | undefined;
  readonly type: string | null | undefined;
  readonly user_id: string | null | undefined;
  readonly vfolder_mounts: ReadonlyArray<string | null | undefined> | null | undefined;
  readonly vfolder_nodes: {
    readonly count: number | null | undefined;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly " $fragmentSpreads": FragmentRefs<"FolderLink_vfolderNode">;
      } | null | undefined;
    } | null | undefined>;
  } | null | undefined;
  readonly " $fragmentSpreads": FragmentRefs<"AppLauncherModalFragment" | "BAISessionAgentIdsFragment" | "BAISessionClusterModeFragment" | "BAISessionTypeTagFragment" | "ContainerCommitModalFragment" | "ContainerLogModalFragment" | "EditableSessionNameFragment" | "MountedVFolderLinksFragment" | "SessionActionButtonsFragment" | "SessionIdleChecksNodeFragment" | "SessionReservationFragment" | "SessionStatusDetailModalFragment" | "SessionStatusTagFragment" | "SessionUsageMonitorFragment">;
  readonly " $fragmentType": "SessionDetailContentFragment";
} | null | undefined;
export type SessionDetailContentFragment$key = {
  readonly " $data"?: SessionDetailContentFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"SessionDetailContentFragment">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "row_id",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
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
  "name": "count",
  "storageKey": null
},
v5 = [
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
          (v1/*: any*/),
          (v2/*: any*/),
          (v3/*: any*/)
        ],
        "storageKey": null
      }
    ],
    "storageKey": null
  },
  (v4/*: any*/)
];
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "SessionDetailContentFragment",
  "selections": [
    (v0/*: any*/),
    (v1/*: any*/),
    (v2/*: any*/),
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
      "name": "user_id",
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
      "kind": "ScalarField",
      "name": "resource_opts",
      "storageKey": null
    },
    (v3/*: any*/),
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
      "name": "vfolder_mounts",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "VirtualFolderConnection",
      "kind": "LinkedField",
      "name": "vfolder_nodes",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "VirtualFolderEdge",
          "kind": "LinkedField",
          "name": "edges",
          "plural": true,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "VirtualFolderNode",
              "kind": "LinkedField",
              "name": "node",
              "plural": false,
              "selections": [
                {
                  "args": null,
                  "kind": "FragmentSpread",
                  "name": "FolderLink_vfolderNode"
                }
              ],
              "storageKey": null
            }
          ],
          "storageKey": null
        },
        (v4/*: any*/)
      ],
      "storageKey": null
    },
    {
      "kind": "RequiredField",
      "field": {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "created_at",
        "storageKey": null
      },
      "action": "NONE"
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
      "name": "scaling_group",
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
      "name": "requested_slots",
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
      "name": "tag",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "idle_checks",
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
      "name": "startup_command",
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
                },
                {
                  "args": null,
                  "kind": "FragmentSpread",
                  "name": "ConnectedKernelListFragment"
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
      "concreteType": "ComputeSessionConnection",
      "kind": "LinkedField",
      "name": "dependees",
      "plural": false,
      "selections": (v5/*: any*/),
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "ComputeSessionConnection",
      "kind": "LinkedField",
      "name": "dependents",
      "plural": false,
      "selections": (v5/*: any*/),
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
      "name": "SessionActionButtonsFragment"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "BAISessionTypeTagFragment"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "EditableSessionNameFragment"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "SessionReservationFragment"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "ContainerLogModalFragment"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "SessionUsageMonitorFragment"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "ContainerCommitModalFragment"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "SessionIdleChecksNodeFragment"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "SessionStatusDetailModalFragment"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "AppLauncherModalFragment"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "MountedVFolderLinksFragment"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "BAISessionAgentIdsFragment"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "BAISessionClusterModeFragment"
    }
  ],
  "type": "ComputeSessionNode",
  "abstractKey": null
};
})();

(node as any).hash = "1f228b44f4bfe0b596275be5ffb3d0fd";

export default node;

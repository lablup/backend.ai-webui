/**
 * @generated SignedSource<<24939bb25694bce1075c27430d259a4d>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type MountPermission = "READ_ONLY" | "READ_WRITE" | "RW_DELETE" | "%future added value";
export type VFolderAutoMountScopeType = "PROJECT" | "USER" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type VFolderNodesV2AutoMountCellFragment$data = {
  readonly vfolderAutoMounts: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly entityId: string;
        readonly id: string;
        readonly mountDestination: string;
        readonly mountPermission: MountPermission;
        readonly scopeId: string;
        readonly scopeType: VFolderAutoMountScopeType;
        readonly subpath: string;
        readonly " $fragmentSpreads": FragmentRefs<"VFolderAutoMountSettingModalFragment">;
      };
    }>;
  } | null | undefined;
  readonly " $fragmentType": "VFolderNodesV2AutoMountCellFragment";
};
export type VFolderNodesV2AutoMountCellFragment$key = {
  readonly " $data"?: VFolderNodesV2AutoMountCellFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"VFolderNodesV2AutoMountCellFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "VFolderNodesV2AutoMountCellFragment",
  "selections": [
    {
      "alias": null,
      "args": [
        {
          "kind": "Literal",
          "name": "limit",
          "value": 1
        }
      ],
      "concreteType": "VFolderAutoMountConnection",
      "kind": "LinkedField",
      "name": "vfolderAutoMounts",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "VFolderAutoMountEdge",
          "kind": "LinkedField",
          "name": "edges",
          "plural": true,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "VFolderAutoMount",
              "kind": "LinkedField",
              "name": "node",
              "plural": false,
              "selections": [
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "id",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "entityId",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "scopeType",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "scopeId",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "mountDestination",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "subpath",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "mountPermission",
                  "storageKey": null
                },
                {
                  "args": null,
                  "kind": "FragmentSpread",
                  "name": "VFolderAutoMountSettingModalFragment"
                }
              ],
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": "vfolderAutoMounts(limit:1)"
    }
  ],
  "type": "VFolder",
  "abstractKey": null
};

(node as any).hash = "0e85a99185061f3386843ca7d1de4d3a";

export default node;

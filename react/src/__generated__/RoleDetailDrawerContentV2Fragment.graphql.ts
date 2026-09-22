/**
 * @generated SignedSource<<8661c8ca1a55a86868b627051bd0bc8c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type RoleSource = "CUSTOM" | "SYSTEM" | "%future added value";
export type RoleStatus = "ACTIVE" | "DELETED" | "INACTIVE" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type RoleDetailDrawerContentV2Fragment$data = {
  readonly autoAssign: boolean;
  readonly createdAt: string;
  readonly description: string | null | undefined;
  readonly name: string;
  readonly scope: {
    readonly basicInfo?: {
      readonly email?: string;
      readonly name: string;
    };
    readonly metadata?: {
      readonly name?: string;
      readonly sessionName: string;
    };
    readonly name?: string;
    readonly project?: string | null | undefined;
    readonly registryName?: string;
    readonly vfolderName?: string | null | undefined;
  } | null | undefined;
  readonly scopeId: string;
  readonly scopeType: string;
  readonly source: RoleSource;
  readonly status: RoleStatus;
  readonly updatedAt: string;
  readonly " $fragmentSpreads": FragmentRefs<"RoleAssignmentTabFragment" | "RolePermissionSummaryTableFragment">;
  readonly " $fragmentType": "RoleDetailDrawerContentV2Fragment";
};
export type RoleDetailDrawerContentV2Fragment$key = {
  readonly " $data"?: RoleDetailDrawerContentV2Fragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"RoleDetailDrawerContentV2Fragment">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v1 = [
  (v0/*: any*/)
];
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RoleDetailDrawerContentV2Fragment",
  "selections": [
    (v0/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "description",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "source",
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
      "name": "autoAssign",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "createdAt",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "updatedAt",
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
      "concreteType": null,
      "kind": "LinkedField",
      "name": "scope",
      "plural": false,
      "selections": [
        {
          "kind": "InlineFragment",
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "DomainBasicInfo",
              "kind": "LinkedField",
              "name": "basicInfo",
              "plural": false,
              "selections": (v1/*: any*/),
              "storageKey": null
            }
          ],
          "type": "DomainV2",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "ProjectBasicInfo",
              "kind": "LinkedField",
              "name": "basicInfo",
              "plural": false,
              "selections": (v1/*: any*/),
              "storageKey": null
            }
          ],
          "type": "ProjectV2",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "UserV2BasicInfo",
              "kind": "LinkedField",
              "name": "basicInfo",
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
            }
          ],
          "type": "UserV2",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": [
            {
              "alias": "vfolderName",
              "args": null,
              "kind": "ScalarField",
              "name": "name",
              "storageKey": null
            }
          ],
          "type": "VirtualFolderNode",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "SessionV2MetadataInfo",
              "kind": "LinkedField",
              "name": "metadata",
              "plural": false,
              "selections": [
                {
                  "alias": "sessionName",
                  "args": null,
                  "kind": "ScalarField",
                  "name": "name",
                  "storageKey": null
                }
              ],
              "storageKey": null
            }
          ],
          "type": "SessionV2",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "ModelDeploymentMetadata",
              "kind": "LinkedField",
              "name": "metadata",
              "plural": false,
              "selections": (v1/*: any*/),
              "storageKey": null
            }
          ],
          "type": "ModelDeployment",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": (v1/*: any*/),
          "type": "ResourceGroup",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "registryName",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "project",
              "storageKey": null
            }
          ],
          "type": "ContainerRegistryV2",
          "abstractKey": null
        }
      ],
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "RoleAssignmentTabFragment"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "RolePermissionSummaryTableFragment"
    }
  ],
  "type": "Role",
  "abstractKey": null
};
})();

(node as any).hash = "e04b3177be0f79e5b6ba43776a82db7b";

export default node;

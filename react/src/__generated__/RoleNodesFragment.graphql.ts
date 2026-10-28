/**
 * @generated SignedSource<<c476d1b0ae3881add0f4a3d41193b01b>>
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
export type RoleNodesFragment$data = ReadonlyArray<{
  readonly autoAssign: boolean;
  readonly createdAt: string;
  readonly description: string | null | undefined;
  readonly entityId: string;
  readonly id: string;
  readonly name: string;
  readonly rolePreset: {
    readonly name: string;
  } | null | undefined;
  readonly rolePresetId: string | null | undefined;
  readonly scope: {
    readonly basicInfo?: {
      readonly domainName?: string;
      readonly projectName: string;
      readonly userEmail?: string;
    };
    readonly metadata?: {
      readonly name: string;
      readonly sessionName?: string;
    };
    readonly name?: string;
    readonly project?: string | null | undefined;
    readonly registryName?: string;
  } | null | undefined;
  readonly scopeId: string;
  readonly scopeType: string;
  readonly source: RoleSource;
  readonly status: RoleStatus;
  readonly updatedAt: string;
  readonly " $fragmentType": "RoleNodesFragment";
} | null | undefined>;
export type RoleNodesFragment$key = ReadonlyArray<{
  readonly " $data"?: RoleNodesFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"RoleNodesFragment">;
}>;

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
  "metadata": {
    "plural": true
  },
  "name": "RoleNodesFragment",
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
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "entityId",
      "storageKey": null
    },
    {
      "kind": "RequiredField",
      "field": (v0/*: any*/),
      "action": "NONE"
    },
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
      "kind": "ScalarField",
      "name": "rolePresetId",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "RolePreset",
      "kind": "LinkedField",
      "name": "rolePreset",
      "plural": false,
      "selections": (v1/*: any*/),
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
              "concreteType": "ProjectBasicInfo",
              "kind": "LinkedField",
              "name": "basicInfo",
              "plural": false,
              "selections": [
                {
                  "alias": "projectName",
                  "args": null,
                  "kind": "ScalarField",
                  "name": "name",
                  "storageKey": null
                }
              ],
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
              "concreteType": "DomainBasicInfo",
              "kind": "LinkedField",
              "name": "basicInfo",
              "plural": false,
              "selections": [
                {
                  "alias": "domainName",
                  "args": null,
                  "kind": "ScalarField",
                  "name": "name",
                  "storageKey": null
                }
              ],
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
              "concreteType": "UserV2BasicInfo",
              "kind": "LinkedField",
              "name": "basicInfo",
              "plural": false,
              "selections": [
                {
                  "alias": "userEmail",
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
              "alias": null,
              "args": null,
              "concreteType": "VFolderMetadataInfo",
              "kind": "LinkedField",
              "name": "metadata",
              "plural": false,
              "selections": (v1/*: any*/),
              "storageKey": null
            }
          ],
          "type": "VFolder",
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
    }
  ],
  "type": "Role",
  "abstractKey": null
};
})();

(node as any).hash = "3b76b8c7f183f6512ebe0e630c1a3203";

export default node;

/**
 * @generated SignedSource<<3113fe74a1023ceee0d1f4e728027e4b>>
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
export type RoleDetailDrawerContentFragment$data = {
  readonly autoAssign: boolean;
  readonly createdAt: string;
  readonly deletedAt: string | null | undefined;
  readonly description: string | null | undefined;
  readonly firstScope: {
    readonly count: number;
    readonly edges: ReadonlyArray<{
      readonly node: {
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
      };
    }>;
  } | null | undefined;
  readonly id: string;
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
  readonly " $fragmentSpreads": FragmentRefs<"RoleAssignmentTabFragment" | "RolePermissionDetailTab_roleScopeFragment">;
  readonly " $fragmentType": "RoleDetailDrawerContentFragment";
};
export type RoleDetailDrawerContentFragment$key = {
  readonly " $data"?: RoleDetailDrawerContentFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"RoleDetailDrawerContentFragment">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "scopeType",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "scopeId",
  "storageKey": null
},
v3 = [
  (v0/*: any*/)
],
v4 = {
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
          "selections": (v3/*: any*/),
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
          "selections": (v3/*: any*/),
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
          "selections": (v3/*: any*/),
          "storageKey": null
        }
      ],
      "type": "ModelDeployment",
      "abstractKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": (v3/*: any*/),
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
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RoleDetailDrawerContentFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
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
      "name": "deletedAt",
      "storageKey": null
    },
    (v1/*: any*/),
    (v2/*: any*/),
    (v4/*: any*/),
    {
      "alias": "firstScope",
      "args": [
        {
          "kind": "Literal",
          "name": "first",
          "value": 1
        }
      ],
      "concreteType": "EntityConnection",
      "kind": "LinkedField",
      "name": "scopes",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "count",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "concreteType": "EntityRefEdge",
          "kind": "LinkedField",
          "name": "edges",
          "plural": true,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "EntityRef",
              "kind": "LinkedField",
              "name": "node",
              "plural": false,
              "selections": [
                (v1/*: any*/),
                (v2/*: any*/),
                (v4/*: any*/)
              ],
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": "scopes(first:1)"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "RoleAssignmentTabFragment"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "RolePermissionDetailTab_roleScopeFragment"
    }
  ],
  "type": "Role",
  "abstractKey": null
};
})();

(node as any).hash = "8630b651c56b3771b1cd51ed34848cd4";

export default node;

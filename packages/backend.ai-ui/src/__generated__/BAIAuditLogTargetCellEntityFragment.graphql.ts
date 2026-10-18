/**
 * @generated SignedSource<<22ba1466bc11b80c2bd97dfaec1a1b8e>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BAIAuditLogTargetCellEntityFragment$data = {
  readonly __typename: "AppConfigAllowList";
  readonly configName: string;
  readonly " $fragmentType": "BAIAuditLogTargetCellEntityFragment";
} | {
  readonly __typename: "AppConfigDefinition";
  readonly configName: string;
  readonly " $fragmentType": "BAIAuditLogTargetCellEntityFragment";
} | {
  readonly __typename: "AppConfigFragment";
  readonly configName: string;
  readonly " $fragmentType": "BAIAuditLogTargetCellEntityFragment";
} | {
  readonly __typename: "Artifact";
  readonly name: string;
  readonly " $fragmentType": "BAIAuditLogTargetCellEntityFragment";
} | {
  readonly __typename: "ArtifactRegistry";
  readonly name: string;
  readonly " $fragmentType": "BAIAuditLogTargetCellEntityFragment";
} | {
  readonly __typename: "ComputeSessionNode";
  readonly sessionName: string | null | undefined;
  readonly " $fragmentType": "BAIAuditLogTargetCellEntityFragment";
} | {
  readonly __typename: "ContainerRegistryV2";
  readonly registryName: string;
  readonly " $fragmentType": "BAIAuditLogTargetCellEntityFragment";
} | {
  readonly __typename: "DomainV2";
  readonly basicInfo: {
    readonly name: string;
  };
  readonly " $fragmentType": "BAIAuditLogTargetCellEntityFragment";
} | {
  readonly __typename: "IdleChecker";
  readonly name: string;
  readonly " $fragmentType": "BAIAuditLogTargetCellEntityFragment";
} | {
  readonly __typename: "ImageV2";
  readonly identity: {
    readonly canonicalName: string;
  };
  readonly " $fragmentType": "BAIAuditLogTargetCellEntityFragment";
} | {
  readonly __typename: "ModelDeployment";
  readonly metadata: {
    readonly name: string;
  };
  readonly " $fragmentType": "BAIAuditLogTargetCellEntityFragment";
} | {
  readonly __typename: "NotificationChannel";
  readonly name: string;
  readonly " $fragmentType": "BAIAuditLogTargetCellEntityFragment";
} | {
  readonly __typename: "NotificationRule";
  readonly name: string;
  readonly " $fragmentType": "BAIAuditLogTargetCellEntityFragment";
} | {
  readonly __typename: "ObjectStorage";
  readonly name: string;
  readonly " $fragmentType": "BAIAuditLogTargetCellEntityFragment";
} | {
  readonly __typename: "ProjectV2";
  readonly basicInfo: {
    readonly name: string;
  };
  readonly " $fragmentType": "BAIAuditLogTargetCellEntityFragment";
} | {
  readonly __typename: "ResourceGroup";
  readonly name: string;
  readonly " $fragmentType": "BAIAuditLogTargetCellEntityFragment";
} | {
  readonly __typename: "Role";
  readonly name: string;
  readonly " $fragmentType": "BAIAuditLogTargetCellEntityFragment";
} | {
  readonly __typename: "RuntimeVariant";
  readonly name: string;
  readonly " $fragmentType": "BAIAuditLogTargetCellEntityFragment";
} | {
  readonly __typename: "RuntimeVariantPreset";
  readonly name: string;
  readonly " $fragmentType": "BAIAuditLogTargetCellEntityFragment";
} | {
  readonly __typename: "SessionV2";
  readonly metadata: {
    readonly name: string;
  };
  readonly " $fragmentType": "BAIAuditLogTargetCellEntityFragment";
} | {
  readonly __typename: "StorageNamespace";
  readonly namespace: string;
  readonly " $fragmentType": "BAIAuditLogTargetCellEntityFragment";
} | {
  readonly __typename: "UserV2";
  readonly basicInfo: {
    readonly email: string;
  };
  readonly " $fragmentType": "BAIAuditLogTargetCellEntityFragment";
} | {
  readonly __typename: "VFSStorage";
  readonly name: string;
  readonly " $fragmentType": "BAIAuditLogTargetCellEntityFragment";
} | {
  readonly __typename: "VFolder";
  readonly metadata: {
    readonly name: string;
  };
  readonly " $fragmentType": "BAIAuditLogTargetCellEntityFragment";
} | {
  readonly __typename: "VirtualFolderNode";
  readonly vfolderName: string | null | undefined;
  readonly " $fragmentType": "BAIAuditLogTargetCellEntityFragment";
} | {
  // This will never be '%other', but we need some
  // value in case none of the concrete values match.
  readonly __typename: "%other";
  readonly " $fragmentType": "BAIAuditLogTargetCellEntityFragment";
};
export type BAIAuditLogTargetCellEntityFragment$key = {
  readonly " $data"?: BAIAuditLogTargetCellEntityFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"BAIAuditLogTargetCellEntityFragment">;
};

const node: ReaderFragment = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "name",
    "storageKey": null
  }
],
v1 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "configName",
    "storageKey": null
  }
];
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "BAIAuditLogTargetCellEntityFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "__typename",
      "storageKey": null
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
          "alias": null,
          "args": null,
          "concreteType": "ProjectBasicInfo",
          "kind": "LinkedField",
          "name": "basicInfo",
          "plural": false,
          "selections": (v0/*: any*/),
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
          "selections": (v0/*: any*/),
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
          "concreteType": "ImageV2IdentityInfo",
          "kind": "LinkedField",
          "name": "identity",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "canonicalName",
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ],
      "type": "ImageV2",
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
          "selections": (v0/*: any*/),
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
          "selections": (v0/*: any*/),
          "storageKey": null
        }
      ],
      "type": "ModelDeployment",
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
          "selections": (v0/*: any*/),
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
          "alias": "sessionName",
          "args": null,
          "kind": "ScalarField",
          "name": "name",
          "storageKey": null
        }
      ],
      "type": "ComputeSessionNode",
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
        }
      ],
      "type": "ContainerRegistryV2",
      "abstractKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": (v1/*: any*/),
      "type": "AppConfigAllowList",
      "abstractKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": (v1/*: any*/),
      "type": "AppConfigDefinition",
      "abstractKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": (v1/*: any*/),
      "type": "AppConfigFragment",
      "abstractKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "namespace",
          "storageKey": null
        }
      ],
      "type": "StorageNamespace",
      "abstractKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": (v0/*: any*/),
      "type": "Artifact",
      "abstractKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": (v0/*: any*/),
      "type": "ArtifactRegistry",
      "abstractKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": (v0/*: any*/),
      "type": "NotificationChannel",
      "abstractKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": (v0/*: any*/),
      "type": "NotificationRule",
      "abstractKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": (v0/*: any*/),
      "type": "ResourceGroup",
      "abstractKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": (v0/*: any*/),
      "type": "Role",
      "abstractKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": (v0/*: any*/),
      "type": "IdleChecker",
      "abstractKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": (v0/*: any*/),
      "type": "ObjectStorage",
      "abstractKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": (v0/*: any*/),
      "type": "RuntimeVariant",
      "abstractKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": (v0/*: any*/),
      "type": "RuntimeVariantPreset",
      "abstractKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": (v0/*: any*/),
      "type": "VFSStorage",
      "abstractKey": null
    }
  ],
  "type": "EntityNode",
  "abstractKey": "__isEntityNode"
};
})();

(node as any).hash = "b88668cafeb16e593701d68030e4d77c";

export default node;

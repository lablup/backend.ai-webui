/**
 * @generated SignedSource<<0db73f8b222af8d287e4f9e3792dc879>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type FolderExplorerModalV2OwnershipFragment$data = {
  readonly ownership: {
    readonly project: {
      readonly basicInfo: {
        readonly name: string;
      };
    } | null | undefined;
    readonly projectId: string | null | undefined;
  };
  readonly " $fragmentType": "FolderExplorerModalV2OwnershipFragment";
};
export type FolderExplorerModalV2OwnershipFragment$key = {
  readonly " $data"?: FolderExplorerModalV2OwnershipFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"FolderExplorerModalV2OwnershipFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "FolderExplorerModalV2OwnershipFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "VFolderOwnershipInfo",
      "kind": "LinkedField",
      "name": "ownership",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "projectId",
          "storageKey": null
        },
        {
          "kind": "CatchField",
          "field": {
            "alias": null,
            "args": null,
            "concreteType": "ProjectV2",
            "kind": "LinkedField",
            "name": "project",
            "plural": false,
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
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "name",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          "to": "NULL"
        }
      ],
      "storageKey": null
    }
  ],
  "type": "VFolder",
  "abstractKey": null
};

(node as any).hash = "0256b475a6756f13180b542661f5d37f";

export default node;

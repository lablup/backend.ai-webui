/**
 * @generated SignedSource<<4cd7ad526272124a9e7189f6e7da3c6e>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type ModelCardV2AccessLevel = "INTERNAL" | "PUBLIC" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type AdminModelCardSettingModalFragment$data = {
  readonly accessLevel: ModelCardV2AccessLevel;
  readonly domainName: string;
  readonly id: string;
  readonly metadata: {
    readonly architecture: string | null | undefined;
    readonly author: string | null | undefined;
    readonly category: string | null | undefined;
    readonly description: string | null | undefined;
    readonly framework: ReadonlyArray<string>;
    readonly label: ReadonlyArray<string>;
    readonly license: string | null | undefined;
    readonly modelVersion: string | null | undefined;
    readonly task: string | null | undefined;
    readonly title: string | null | undefined;
  };
  readonly name: string;
  readonly projectId: string;
  readonly readme: string | null | undefined;
  readonly vfolder: {
    readonly metadata: {
      readonly name: string;
    };
    readonly " $fragmentSpreads": FragmentRefs<"VFolderNodeIdenticonV2Fragment">;
  } | null | undefined;
  readonly vfolderId: string;
  readonly " $fragmentType": "AdminModelCardSettingModalFragment";
};
export type AdminModelCardSettingModalFragment$key = {
  readonly " $data"?: AdminModelCardSettingModalFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"AdminModelCardSettingModalFragment">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "AdminModelCardSettingModalFragment",
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
      "name": "vfolderId",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "VFolder",
      "kind": "LinkedField",
      "name": "vfolder",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "VFolderMetadataInfo",
          "kind": "LinkedField",
          "name": "metadata",
          "plural": false,
          "selections": [
            (v0/*: any*/)
          ],
          "storageKey": null
        },
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "VFolderNodeIdenticonV2Fragment"
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "domainName",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "projectId",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "readme",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "accessLevel",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "ModelCardV2Metadata",
      "kind": "LinkedField",
      "name": "metadata",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "author",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "title",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "modelVersion",
          "storageKey": null
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
          "name": "task",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "category",
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
          "name": "framework",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "label",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "license",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "ModelCardV2",
  "abstractKey": null
};
})();

(node as any).hash = "fc20746dc758eebbc7867c29352fafa2";

export default node;

/**
 * @generated SignedSource<<e27ba03f7da8fe3cc3e1a952d2399e02>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ModelCardDrawerFragment$data = {
  readonly createdAt: string;
  readonly entityId: string;
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
  readonly minResource: ReadonlyArray<{
    readonly quantity: string;
    readonly resourceType: string;
  }> | null | undefined;
  readonly name: string;
  readonly readme: string | null | undefined;
  readonly updatedAt: string | null | undefined;
  readonly vfolder: {
    readonly entityId: string;
    readonly id: string;
    readonly metadata: {
      readonly name: string;
    };
    readonly " $fragmentSpreads": FragmentRefs<"VFolderNodeIdenticonV2Fragment">;
  } | null | undefined;
  readonly " $fragmentSpreads": FragmentRefs<"ModelCardDeployModalFragment">;
  readonly " $fragmentType": "ModelCardDrawerFragment";
};
export type ModelCardDrawerFragment$key = {
  readonly " $data"?: ModelCardDrawerFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"ModelCardDrawerFragment">;
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
  "name": "entityId",
  "storageKey": null
},
v2 = {
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
  "name": "ModelCardDrawerFragment",
  "selections": [
    (v0/*: any*/),
    (v1/*: any*/),
    (v2/*: any*/),
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
          "name": "title",
          "storageKey": null
        },
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
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "modelVersion",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "ModelCardV2ResourceSlotEntry",
      "kind": "LinkedField",
      "name": "minResource",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "resourceType",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "quantity",
          "storageKey": null
        }
      ],
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
      "concreteType": "VFolder",
      "kind": "LinkedField",
      "name": "vfolder",
      "plural": false,
      "selections": [
        (v0/*: any*/),
        (v1/*: any*/),
        {
          "alias": null,
          "args": null,
          "concreteType": "VFolderMetadataInfo",
          "kind": "LinkedField",
          "name": "metadata",
          "plural": false,
          "selections": [
            (v2/*: any*/)
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
      "args": null,
      "kind": "FragmentSpread",
      "name": "ModelCardDeployModalFragment"
    }
  ],
  "type": "ModelCardV2",
  "abstractKey": null
};
})();

(node as any).hash = "1cd5924e8a7a64641c13b994b5e6e785";

export default node;

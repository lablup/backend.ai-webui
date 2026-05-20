/**
 * @generated SignedSource<<63b206b6ff44b9e5891010c237cca781>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type LegacyModelCardModalFragment$data = {
  readonly architecture: string | null | undefined;
  readonly author: string | null | undefined;
  readonly category: string | null | undefined;
  readonly created_at: string | null | undefined;
  readonly description: string | null | undefined;
  readonly error_msg: string | null | undefined;
  readonly framework: ReadonlyArray<string | null | undefined> | null | undefined;
  readonly id: string;
  readonly label: ReadonlyArray<string | null | undefined> | null | undefined;
  readonly license: string | null | undefined;
  readonly min_resource: string | null | undefined;
  readonly modified_at: string | null | undefined;
  readonly name: string | null | undefined;
  readonly readme: string | null | undefined;
  readonly task: string | null | undefined;
  readonly title: string | null | undefined;
  readonly version: string | null | undefined;
  readonly vfolder_node: {
    readonly cloneable: boolean | null | undefined;
    readonly id: string;
    readonly name: string | null | undefined;
    readonly " $fragmentSpreads": FragmentRefs<"LegacyModelTryContentButtonVFolderFragment" | "ModelCloneModalVFolderFragment" | "VFolderNodeIdenticonFragment">;
  } | null | undefined;
  readonly " $fragmentType": "LegacyModelCardModalFragment";
};
export type LegacyModelCardModalFragment$key = {
  readonly " $data"?: LegacyModelCardModalFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"LegacyModelCardModalFragment">;
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
  "name": "name",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "LegacyModelCardModalFragment",
  "selections": [
    (v0/*: any*/),
    (v1/*: any*/),
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
      "name": "version",
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
      "name": "modified_at",
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
      "name": "readme",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "min_resource",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "VirtualFolderNode",
      "kind": "LinkedField",
      "name": "vfolder_node",
      "plural": false,
      "selections": [
        (v0/*: any*/),
        (v1/*: any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "cloneable",
          "storageKey": null
        },
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "ModelCloneModalVFolderFragment"
        },
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "LegacyModelTryContentButtonVFolderFragment"
        },
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "VFolderNodeIdenticonFragment"
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "error_msg",
      "storageKey": null
    }
  ],
  "type": "ModelCard",
  "abstractKey": null
};
})();

(node as any).hash = "8fbbaedebfa00527f0673098aaf350f3";

export default node;

/**
 * @generated SignedSource<<71f2d75c48ab4abe69ce5915f37e4cd4>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type RoleFormModalFragment$data = {
  readonly autoAssign: boolean;
  readonly description: string | null | undefined;
  readonly entityId: string;
  readonly id: string;
  readonly name: string;
  readonly " $fragmentType": "RoleFormModalFragment";
};
export type RoleFormModalFragment$key = {
  readonly " $data"?: RoleFormModalFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"RoleFormModalFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RoleFormModalFragment",
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
      "name": "name",
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
      "name": "autoAssign",
      "storageKey": null
    }
  ],
  "type": "Role",
  "abstractKey": null
};

(node as any).hash = "96b9776890bc555c49b45d6db1d7f29b";

export default node;

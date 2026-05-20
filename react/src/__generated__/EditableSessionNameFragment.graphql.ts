/**
 * @generated SignedSource<<0e4dd8ea3fcfbc61dd6ae4a491f9db1e>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type EditableSessionNameFragment$data = {
  readonly id: string;
  readonly name: string | null | undefined;
  readonly priority: number | null | undefined;
  readonly project_id: string;
  readonly row_id: string | null | undefined;
  readonly status: string | null | undefined;
  readonly user_id: string | null | undefined;
  readonly " $fragmentType": "EditableSessionNameFragment";
};
export type EditableSessionNameFragment$key = {
  readonly " $data"?: EditableSessionNameFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"EditableSessionNameFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "EditableSessionNameFragment",
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
      "name": "row_id",
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
      "name": "priority",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "user_id",
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
      "kind": "RequiredField",
      "field": {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "project_id",
        "storageKey": null
      },
      "action": "THROW"
    }
  ],
  "type": "ComputeSessionNode",
  "abstractKey": null
};

(node as any).hash = "6dfb2b44bf25b8bfda2fce5ab4cedad8";

export default node;

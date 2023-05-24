/**
 * @generated SignedSource<<e11334bae24afaca052b27158584ca9f>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SessionInfoCellFragment$data = {
  readonly id: string | null;
  readonly name: string | null;
  readonly session_id: any | null;
  readonly status: string | null;
  readonly user_email: string | null;
  readonly " $fragmentType": "SessionInfoCellFragment";
};
export type SessionInfoCellFragment$key = {
  readonly " $data"?: SessionInfoCellFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"SessionInfoCellFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "SessionInfoCellFragment",
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
      "name": "session_id",
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
      "name": "status",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "user_email",
      "storageKey": null
    }
  ],
  "type": "ComputeSession",
  "abstractKey": null
};

(node as any).hash = "d015d6d5c7334b282404ff20f57e7bcf";

export default node;

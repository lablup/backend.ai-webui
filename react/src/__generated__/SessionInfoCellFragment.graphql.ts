/**
 * @generated SignedSource<<051f75a8cc31a3199a276cd3ef6ccd97>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SessionInfoCellFragment$data = {
  readonly id: string | null | undefined;
  readonly image: string | null | undefined;
  readonly name: string | null | undefined;
  readonly session_id: string | null | undefined;
  readonly status: string | null | undefined;
  readonly user_email: string | null | undefined;
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
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "image",
      "storageKey": null
    }
  ],
  "type": "ComputeSession",
  "abstractKey": null
};

(node as any).hash = "93f8cd0d4b47d24ea281955be0ad792b";

export default node;

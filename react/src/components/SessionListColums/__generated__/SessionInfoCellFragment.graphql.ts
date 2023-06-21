/**
 * @generated SignedSource<<705ef385310781207a9535f4072f5109>>
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
  readonly image: string | null;
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

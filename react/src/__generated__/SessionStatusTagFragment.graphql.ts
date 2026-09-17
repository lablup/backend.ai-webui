/**
 * @generated SignedSource<<fd1253e36646b9f094b8228f0ed7fefe>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SessionStatusTagFragment$data = {
  readonly id: string;
  readonly queue_position: number | null | undefined;
  readonly status: string | null | undefined;
  readonly status_info: string | null | undefined;
  readonly " $fragmentType": "SessionStatusTagFragment";
};
export type SessionStatusTagFragment$key = {
  readonly " $data"?: SessionStatusTagFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"SessionStatusTagFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "SessionStatusTagFragment",
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
      "name": "status",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "status_info",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "queue_position",
      "storageKey": null
    }
  ],
  "type": "ComputeSessionNode",
  "abstractKey": null
};

(node as any).hash = "fbc4d47be98bf84fc90c14ee936430cd";

export default node;

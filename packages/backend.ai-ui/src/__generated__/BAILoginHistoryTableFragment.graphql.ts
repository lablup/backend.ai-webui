/**
 * @generated SignedSource<<b46502ce6db2a4e97c42f8343a01d795>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type LoginAttemptResult = "EVICTED" | "EXPIRED" | "FAILED_BLOCKED" | "FAILED_INVALID_CREDENTIALS" | "FAILED_PASSWORD_EXPIRED" | "FAILED_REJECTED_BY_HOOK" | "FAILED_SESSION_ALREADY_EXISTS" | "FAILED_USER_INACTIVE" | "LOGOUT" | "REVOKED_BY_ADMIN" | "REVOKED_BY_USER" | "SUCCESS" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type BAILoginHistoryTableFragment$data = ReadonlyArray<{
  readonly createdAt: string;
  readonly domainName: string;
  readonly failReason: string | null | undefined;
  readonly id: string;
  readonly result: LoginAttemptResult;
  readonly " $fragmentType": "BAILoginHistoryTableFragment";
}>;
export type BAILoginHistoryTableFragment$key = ReadonlyArray<{
  readonly " $data"?: BAILoginHistoryTableFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"BAILoginHistoryTableFragment">;
}>;

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "BAILoginHistoryTableFragment",
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
      "name": "result",
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
      "name": "failReason",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "createdAt",
      "storageKey": null
    }
  ],
  "type": "LoginHistoryV2",
  "abstractKey": null
};

(node as any).hash = "7e66ffc2186bbcd9be2f6196b9467f1c";

export default node;

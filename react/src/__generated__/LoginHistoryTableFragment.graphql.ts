/**
 * @generated SignedSource<<ae9d24b12118cc4abcd9da38a807d7eb>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type LoginAttemptResult = "EVICTED" | "EXPIRED" | "FAILED_BLOCKED" | "FAILED_INVALID_CREDENTIALS" | "FAILED_PASSWORD_EXPIRED" | "FAILED_REJECTED_BY_HOOK" | "FAILED_SESSION_ALREADY_EXISTS" | "FAILED_USER_INACTIVE" | "LOGOUT" | "REVOKED_BY_ADMIN" | "REVOKED_BY_USER" | "SUCCESS" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type LoginHistoryTableFragment$data = ReadonlyArray<{
  readonly createdAt: string;
  readonly domainName: string;
  readonly failReason: string | null | undefined;
  readonly id: string;
  readonly result: LoginAttemptResult;
  readonly " $fragmentType": "LoginHistoryTableFragment";
}>;
export type LoginHistoryTableFragment$key = ReadonlyArray<{
  readonly " $data"?: LoginHistoryTableFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"LoginHistoryTableFragment">;
}>;

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "LoginHistoryTableFragment",
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

(node as any).hash = "4dfc2f6ccb6413b8af45b3902aa77534";

export default node;

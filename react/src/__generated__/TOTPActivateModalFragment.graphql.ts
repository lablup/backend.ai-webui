/**
 * @generated SignedSource<<210f88d5d02a5f74bafedbc558a70af4>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type TOTPActivateModalFragment$data = {
  readonly email: string | null | undefined;
  readonly totp_activated: boolean | null | undefined;
  readonly " $fragmentType": "TOTPActivateModalFragment";
};
export type TOTPActivateModalFragment$key = {
  readonly " $data"?: TOTPActivateModalFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"TOTPActivateModalFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [
    {
      "kind": "RootArgument",
      "name": "isNotSupportTotp"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "TOTPActivateModalFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "email",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "totp_activated",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

(node as any).hash = "f5da6b3094f7d70bef9373d9c907955c";

export default node;

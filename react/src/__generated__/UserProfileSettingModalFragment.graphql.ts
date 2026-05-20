/**
 * @generated SignedSource<<ba86ff2ce6afa0cfa99f735b07cec9f7>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type UserProfileSettingModalFragment$data = {
  readonly allowed_client_ip: ReadonlyArray<string | null | undefined> | null | undefined;
  readonly full_name: string | null | undefined;
  readonly id: string | null | undefined;
  readonly totp_activated: boolean | null | undefined;
  readonly " $fragmentSpreads": FragmentRefs<"TOTPActivateModalFragment">;
  readonly " $fragmentType": "UserProfileSettingModalFragment";
};
export type UserProfileSettingModalFragment$key = {
  readonly " $data"?: UserProfileSettingModalFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"UserProfileSettingModalFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [
    {
      "kind": "RootArgument",
      "name": "isNotSupportTotp"
    },
    {
      "kind": "RootArgument",
      "name": "isNotSupportUpdateUserV2"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "UserProfileSettingModalFragment",
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
      "name": "full_name",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "totp_activated",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "allowed_client_ip",
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "TOTPActivateModalFragment"
    }
  ],
  "type": "User",
  "abstractKey": null
};

(node as any).hash = "dc28655b632e6c63e50ea41267a10be1";

export default node;

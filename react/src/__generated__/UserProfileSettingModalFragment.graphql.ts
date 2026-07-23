/**
 * @generated SignedSource<<8acf95169f0d1be4db6400c353a419b2>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type UserProfileSettingModalFragment$data = {
  readonly basicInfo: {
    readonly email: string;
    readonly fullName: string | null | undefined;
  };
  readonly id: string;
  readonly security: {
    readonly allowedClientIp: ReadonlyArray<string> | null | undefined;
    readonly totpActivated: boolean | null | undefined;
  };
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
      "concreteType": "UserV2BasicInfo",
      "kind": "LinkedField",
      "name": "basicInfo",
      "plural": false,
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
          "name": "fullName",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "UserV2SecurityInfo",
      "kind": "LinkedField",
      "name": "security",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "totpActivated",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "allowedClientIp",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "TOTPActivateModalFragment"
    }
  ],
  "type": "UserV2",
  "abstractKey": null
};

(node as any).hash = "7748d6ef82197657e9545689a3497939";

export default node;

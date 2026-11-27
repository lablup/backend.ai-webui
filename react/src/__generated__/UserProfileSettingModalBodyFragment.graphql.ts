/**
 * @generated SignedSource<<6ee481d1ebb27ab17fb22fa5e47f719a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type UserProfileSettingModalBodyFragment$data = {
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
  readonly " $fragmentType": "UserProfileSettingModalBodyFragment";
};
export type UserProfileSettingModalBodyFragment$key = {
  readonly " $data"?: UserProfileSettingModalBodyFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"UserProfileSettingModalBodyFragment">;
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
  "name": "UserProfileSettingModalBodyFragment",
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

(node as any).hash = "b005183696a0e84b2f9d8476cfb7da8f";

export default node;

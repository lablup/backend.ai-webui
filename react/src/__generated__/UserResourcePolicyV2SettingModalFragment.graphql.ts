/**
 * @generated SignedSource<<77aaebf3c66ad71bffc9ccd020300674>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type UserResourcePolicyV2SettingModalFragment$data = {
  readonly id: string;
  readonly maxCustomizedImageCount: number;
  readonly maxQuotaScopeSize: {
    readonly value: number;
  };
  readonly maxSessionCountPerModelSession: number;
  readonly maxVfolderCount: number;
  readonly name: string;
  readonly " $fragmentType": "UserResourcePolicyV2SettingModalFragment";
};
export type UserResourcePolicyV2SettingModalFragment$key = {
  readonly " $data"?: UserResourcePolicyV2SettingModalFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"UserResourcePolicyV2SettingModalFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "UserResourcePolicyV2SettingModalFragment",
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
      "name": "name",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "maxVfolderCount",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "maxSessionCountPerModelSession",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "BinarySizeInfo",
      "kind": "LinkedField",
      "name": "maxQuotaScopeSize",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "value",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "maxCustomizedImageCount",
      "storageKey": null
    }
  ],
  "type": "UserResourcePolicyV2",
  "abstractKey": null
};

(node as any).hash = "aea5fc5ede23436150878af4ea3c338d";

export default node;

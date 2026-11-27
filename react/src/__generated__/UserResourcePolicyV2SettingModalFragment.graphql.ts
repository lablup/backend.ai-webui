/**
 * @generated SignedSource<<51bcd5c8946c9306a8c91e8b5223d593>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type UserResourcePolicyV2SettingModalFragment$data = {
  readonly entityId: string;
  readonly id: string;
  readonly maxConcurrentLogins: number | null | undefined;
  readonly maxCustomizedImageCount: number;
  readonly maxQuotaScopeSize: {
    readonly expr: string;
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
      "name": "entityId",
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
      "name": "maxConcurrentLogins",
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
          "name": "expr",
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

(node as any).hash = "ae5424cb16845f1af7703a07e7a7d60f";

export default node;

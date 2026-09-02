/**
 * @generated SignedSource<<f39dabc507f471b885d8b641f395f228>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type KeypairSettingModalFragment$data = {
  readonly access_key: string | null | undefined;
  readonly rate_limit: number | null | undefined;
  readonly resource_policy: string | null | undefined;
  readonly " $fragmentType": "KeypairSettingModalFragment";
};
export type KeypairSettingModalFragment$key = {
  readonly " $data"?: KeypairSettingModalFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"KeypairSettingModalFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "KeypairSettingModalFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "rate_limit",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "access_key",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "resource_policy",
      "storageKey": null
    }
  ],
  "type": "KeyPair",
  "abstractKey": null
};

(node as any).hash = "a453330249f3d6cb4a241e19f2314614";

export default node;

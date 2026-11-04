/**
 * @generated SignedSource<<d8ab7738240ac34e8c5fc2009a41feb5>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type ClientIPMaskingMode = "DROP" | "NONE" | "TRUNCATE" | "%future added value";
export type ClientIPMaskingTarget = "AUDIT_LOGS" | "DEFAULT" | "LOGIN_HISTORY" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type ClientIpMaskingPolicySettingModalFragment$data = {
  readonly entityId: string;
  readonly id: string;
  readonly ipv4Prefix: number | null | undefined;
  readonly ipv6Prefix: number | null | undefined;
  readonly mode: ClientIPMaskingMode;
  readonly targetType: ClientIPMaskingTarget;
  readonly " $fragmentType": "ClientIpMaskingPolicySettingModalFragment";
};
export type ClientIpMaskingPolicySettingModalFragment$key = {
  readonly " $data"?: ClientIpMaskingPolicySettingModalFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"ClientIpMaskingPolicySettingModalFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ClientIpMaskingPolicySettingModalFragment",
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
      "name": "targetType",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "mode",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "ipv4Prefix",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "ipv6Prefix",
      "storageKey": null
    }
  ],
  "type": "ClientIPMaskingPolicy",
  "abstractKey": null
};

(node as any).hash = "91fceaf30f094b0073d75c957ddf513b";

export default node;

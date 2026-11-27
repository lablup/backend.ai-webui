/**
 * @generated SignedSource<<af52c39fdfd584a6207138b2acab84f9>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ProjectResourcePolicyV2SettingModalFragment$data = {
  readonly entityId: string;
  readonly id: string;
  readonly maxNetworkCount: number;
  readonly maxQuotaScopeSize: {
    readonly expr: string;
  };
  readonly maxVfolderCount: number;
  readonly name: string;
  readonly " $fragmentType": "ProjectResourcePolicyV2SettingModalFragment";
};
export type ProjectResourcePolicyV2SettingModalFragment$key = {
  readonly " $data"?: ProjectResourcePolicyV2SettingModalFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"ProjectResourcePolicyV2SettingModalFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ProjectResourcePolicyV2SettingModalFragment",
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
      "name": "maxNetworkCount",
      "storageKey": null
    }
  ],
  "type": "ProjectResourcePolicyV2",
  "abstractKey": null
};

(node as any).hash = "8a06b76f54a5849b9c00f3a394d21432";

export default node;

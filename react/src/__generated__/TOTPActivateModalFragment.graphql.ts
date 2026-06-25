/**
 * @generated SignedSource<<d38d6a0fa40427f3feb26e4ecf1da514>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type TOTPActivateModalFragment$data = {
  readonly basicInfo: {
    readonly email: string;
  };
  readonly security: {
    readonly totpActivated: boolean | null | undefined;
  };
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
        }
      ],
      "storageKey": null
    }
  ],
  "type": "UserV2",
  "abstractKey": null
};

(node as any).hash = "ea5b0c796463b95ee22c460285ab0847";

export default node;

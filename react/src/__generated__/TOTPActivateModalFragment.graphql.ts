/**
 * @generated SignedSource<<9859b31d3c8377334607578564096061>>
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
    readonly totpActivated?: boolean | null | undefined;
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
          "condition": "isNotSupportTotp",
          "kind": "Condition",
          "passingValue": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "totpActivated",
              "storageKey": null
            }
          ]
        }
      ],
      "storageKey": null
    }
  ],
  "type": "UserV2",
  "abstractKey": null
};

(node as any).hash = "a8097421cb683bde50a7bd7cb9d7c67a";

export default node;

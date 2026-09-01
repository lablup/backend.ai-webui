/**
 * @generated SignedSource<<178c14de1fcdf535cd55298898a880d5>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type GeneratedKeypairListModalFragment$data = ReadonlyArray<{
  readonly keypair: {
    readonly accessKey: string;
    readonly user: {
      readonly basicInfo: {
        readonly email: string;
      };
    } | null | undefined;
  };
  readonly secretKey: string;
  readonly " $fragmentType": "GeneratedKeypairListModalFragment";
}>;
export type GeneratedKeypairListModalFragment$key = ReadonlyArray<{
  readonly " $data"?: GeneratedKeypairListModalFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"GeneratedKeypairListModalFragment">;
}>;

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "GeneratedKeypairListModalFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "secretKey",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "KeyPairV2",
      "kind": "LinkedField",
      "name": "keypair",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "accessKey",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "concreteType": "UserV2",
          "kind": "LinkedField",
          "name": "user",
          "plural": false,
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
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "CreateKeypairPayload",
  "abstractKey": null
};

(node as any).hash = "d2527833fc24a9a79c94517ef855963e";

export default node;

/**
 * @generated SignedSource<<f99fa345b7f57555c857f08f5f188c1b>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BAILoginSessionTableFragment$data = ReadonlyArray<{
  readonly accessKey: string;
  readonly createdAt: string;
  readonly fieldId: string;
  readonly id: string;
  readonly lastAccessedAt: string | null | undefined;
  readonly user: {
    readonly basicInfo: {
      readonly email: string;
    };
    readonly id: string;
  } | null | undefined;
  readonly " $fragmentType": "BAILoginSessionTableFragment";
}>;
export type BAILoginSessionTableFragment$key = ReadonlyArray<{
  readonly " $data"?: BAILoginSessionTableFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"BAILoginSessionTableFragment">;
}>;

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "BAILoginSessionTableFragment",
  "selections": [
    (v0/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "fieldId",
      "storageKey": null
    },
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
      "kind": "ScalarField",
      "name": "createdAt",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "lastAccessedAt",
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
        (v0/*: any*/),
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
  "type": "LoginSessionV2",
  "abstractKey": null
};
})();

(node as any).hash = "951db8f8c2f9e63e9dc2d1aa3a7b896b";

export default node;

/**
 * @generated SignedSource<<3bf8c18c092c8207b75fa939ee3288e8>>
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
  readonly id: string;
  readonly invalidatedAt: string | null | undefined;
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
      "name": "invalidatedAt",
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

(node as any).hash = "694171fd979eb4444dc4d4e07bfb034e";

export default node;

/**
 * @generated SignedSource<<d712cae67b2f506268c804d3679cb08f>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BAIDeploymentOwnerInfo_deployment$data = {
  readonly creator: {
    readonly basicInfo: {
      readonly email: string;
      readonly fullName: string | null | undefined;
      readonly username: string | null | undefined;
    };
    readonly id: string;
  } | null | undefined;
  readonly id: string;
  readonly " $fragmentType": "BAIDeploymentOwnerInfo_deployment";
};
export type BAIDeploymentOwnerInfo_deployment$key = {
  readonly " $data"?: BAIDeploymentOwnerInfo_deployment$data;
  readonly " $fragmentSpreads": FragmentRefs<"BAIDeploymentOwnerInfo_deployment">;
};

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
  "metadata": null,
  "name": "BAIDeploymentOwnerInfo_deployment",
  "selections": [
    (v0/*: any*/),
    {
      "alias": null,
      "args": null,
      "concreteType": "UserV2",
      "kind": "LinkedField",
      "name": "creator",
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
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "username",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "fullName",
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "ModelDeployment",
  "abstractKey": null
};
})();

(node as any).hash = "51992104ffa20a411de63591491a3209";

export default node;

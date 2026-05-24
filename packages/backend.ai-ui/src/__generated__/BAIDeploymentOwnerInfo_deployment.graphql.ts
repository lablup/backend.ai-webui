/**
 * @generated SignedSource<<7d5eb20b77bed16fb654fd24245e4b33>>
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

(node as any).hash = "2136bedc1441155605215b125c4ff041";

export default node;

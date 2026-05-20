/**
 * @generated SignedSource<<bf4a1d60766939ff5203e19c0e70adec>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type DeploymentOwnerInfo_deployment$data = {
  readonly creator: {
    readonly basicInfo: {
      readonly email: string;
      readonly fullName: string | null | undefined;
      readonly username: string | null | undefined;
    };
    readonly id: string;
  } | null | undefined;
  readonly id: string;
  readonly " $fragmentType": "DeploymentOwnerInfo_deployment";
};
export type DeploymentOwnerInfo_deployment$key = {
  readonly " $data"?: DeploymentOwnerInfo_deployment$data;
  readonly " $fragmentSpreads": FragmentRefs<"DeploymentOwnerInfo_deployment">;
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
  "name": "DeploymentOwnerInfo_deployment",
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

(node as any).hash = "e25df89cdc75a297d45202942245c84f";

export default node;

/**
 * @generated SignedSource<<aba832d31e299f0f3a8d6a948569adfa>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type DeploymentReplicasCard_deployment$data = {
  readonly id: string;
  readonly " $fragmentType": "DeploymentReplicasCard_deployment";
};
export type DeploymentReplicasCard_deployment$key = {
  readonly " $data"?: DeploymentReplicasCard_deployment$data;
  readonly " $fragmentSpreads": FragmentRefs<"DeploymentReplicasCard_deployment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DeploymentReplicasCard_deployment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    }
  ],
  "type": "ModelDeployment",
  "abstractKey": null
};

(node as any).hash = "c535e4dd070869785c37a4074751984b";

export default node;

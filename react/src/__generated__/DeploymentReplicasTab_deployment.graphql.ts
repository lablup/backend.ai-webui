/**
 * @generated SignedSource<<d479deadb513870a86cb8ba59160ff56>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type DeploymentReplicasTab_deployment$data = {
  readonly id: string;
  readonly " $fragmentType": "DeploymentReplicasTab_deployment";
};
export type DeploymentReplicasTab_deployment$key = {
  readonly " $data"?: DeploymentReplicasTab_deployment$data;
  readonly " $fragmentSpreads": FragmentRefs<"DeploymentReplicasTab_deployment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DeploymentReplicasTab_deployment",
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

(node as any).hash = "6134739d7e3addb802e0658f5858bcea";

export default node;

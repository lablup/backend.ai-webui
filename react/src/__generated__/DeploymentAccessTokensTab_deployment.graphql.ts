/**
 * @generated SignedSource<<8973cc8699b07cf4f925f81535755f5e>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type DeploymentAccessTokensTab_deployment$data = {
  readonly id: string;
  readonly " $fragmentType": "DeploymentAccessTokensTab_deployment";
};
export type DeploymentAccessTokensTab_deployment$key = {
  readonly " $data"?: DeploymentAccessTokensTab_deployment$data;
  readonly " $fragmentSpreads": FragmentRefs<"DeploymentAccessTokensTab_deployment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DeploymentAccessTokensTab_deployment",
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

(node as any).hash = "3bd042288d60da5fa0247bf2a96e06dd";

export default node;

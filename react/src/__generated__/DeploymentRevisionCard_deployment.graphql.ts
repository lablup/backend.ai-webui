/**
 * @generated SignedSource<<9de24e5c42f155c98c90f2e445f1eddc>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type DeploymentRevisionCard_deployment$data = {
  readonly id: string;
  readonly " $fragmentSpreads": FragmentRefs<"DeploymentCurrentRevisionTab_deployment" | "DeploymentRevisionHistoryTab_deployment">;
  readonly " $fragmentType": "DeploymentRevisionCard_deployment";
};
export type DeploymentRevisionCard_deployment$key = {
  readonly " $data"?: DeploymentRevisionCard_deployment$data;
  readonly " $fragmentSpreads": FragmentRefs<"DeploymentRevisionCard_deployment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DeploymentRevisionCard_deployment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "DeploymentCurrentRevisionTab_deployment"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "DeploymentRevisionHistoryTab_deployment"
    }
  ],
  "type": "ModelDeployment",
  "abstractKey": null
};

(node as any).hash = "2a36e018f7a8b5999cad5c828ae16666";

export default node;

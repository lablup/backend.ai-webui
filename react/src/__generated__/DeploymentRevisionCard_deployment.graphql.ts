/**
 * @generated SignedSource<<69cc8fdf802d52317ee8187e02aca7ee>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type DeploymentRevisionCard_deployment$data = {
  readonly entityId: string;
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
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "entityId",
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

(node as any).hash = "1f3164549b0389ce19a3063cfab29aea";

export default node;

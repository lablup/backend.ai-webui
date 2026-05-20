/**
 * @generated SignedSource<<171468a5cb8e67f95a3d33272b54cbdf>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type DeploymentRevisionHistoryTab_deployment$data = {
  readonly id: string;
  readonly " $fragmentType": "DeploymentRevisionHistoryTab_deployment";
};
export type DeploymentRevisionHistoryTab_deployment$key = {
  readonly " $data"?: DeploymentRevisionHistoryTab_deployment$data;
  readonly " $fragmentSpreads": FragmentRefs<"DeploymentRevisionHistoryTab_deployment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DeploymentRevisionHistoryTab_deployment",
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

(node as any).hash = "d24c62ecda7ccb05acbbc317a5e86bb3";

export default node;

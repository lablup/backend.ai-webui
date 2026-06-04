/**
 * @generated SignedSource<<eb352084a2d3c5fa54fb8701b30c5228>>
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
  readonly networkAccess: {
    readonly endpointUrl: string | null | undefined;
  };
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
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "ModelDeploymentNetworkAccess",
      "kind": "LinkedField",
      "name": "networkAccess",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "endpointUrl",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "ModelDeployment",
  "abstractKey": null
};

(node as any).hash = "48a180522415b103a2e930a5abc7a973";

export default node;

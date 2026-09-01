/**
 * @generated SignedSource<<d62944c99b33dadc3451c93c3c6b37ce>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type DeploymentAccessTokensCard_deployment$data = {
  readonly id: string;
  readonly networkAccess: {
    readonly endpointUrl: string | null | undefined;
  };
  readonly " $fragmentType": "DeploymentAccessTokensCard_deployment";
};
export type DeploymentAccessTokensCard_deployment$key = {
  readonly " $data"?: DeploymentAccessTokensCard_deployment$data;
  readonly " $fragmentSpreads": FragmentRefs<"DeploymentAccessTokensCard_deployment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DeploymentAccessTokensCard_deployment",
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

(node as any).hash = "e7372d3fa2bb21537f6b39e44698dedf";

export default node;

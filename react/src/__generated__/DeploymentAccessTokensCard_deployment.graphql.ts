/**
 * @generated SignedSource<<2b32f02d9eca9ab5b68bc72e1e9d252c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type DeploymentAccessTokensCard_deployment$data = {
  readonly entityId: string;
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
      "kind": "ScalarField",
      "name": "entityId",
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

(node as any).hash = "58ad32b2842a5c91fb4b81a4384e2b60";

export default node;

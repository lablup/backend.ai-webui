/**
 * @generated SignedSource<<d4ecf4b413818268650241f51cf10ff4>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type DeploymentAddRevisionModal_deployment$data = {
  readonly currentRevision: {
    readonly modelMountConfig: {
      readonly vfolderId: string;
    } | null | undefined;
    readonly " $fragmentSpreads": FragmentRefs<"DeploymentAddRevisionModal_revisionSource">;
  } | null | undefined;
  readonly id: string;
  readonly metadata: {
    readonly resourceGroupName: string;
  };
  readonly " $fragmentType": "DeploymentAddRevisionModal_deployment";
};
export type DeploymentAddRevisionModal_deployment$key = {
  readonly " $data"?: DeploymentAddRevisionModal_deployment$data;
  readonly " $fragmentSpreads": FragmentRefs<"DeploymentAddRevisionModal_deployment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DeploymentAddRevisionModal_deployment",
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
      "concreteType": "ModelDeploymentMetadata",
      "kind": "LinkedField",
      "name": "metadata",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "resourceGroupName",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "ModelRevision",
      "kind": "LinkedField",
      "name": "currentRevision",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "ModelMountConfig",
          "kind": "LinkedField",
          "name": "modelMountConfig",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "vfolderId",
              "storageKey": null
            }
          ],
          "storageKey": null
        },
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "DeploymentAddRevisionModal_revisionSource"
        }
      ],
      "storageKey": null
    }
  ],
  "type": "ModelDeployment",
  "abstractKey": null
};

(node as any).hash = "614548b7fde80b4972dfb192b893b832";

export default node;

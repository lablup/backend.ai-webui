/**
 * @generated SignedSource<<c84b0f4e1b71865ad9f12976c17dd653>>
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
    readonly projectId: string;
    readonly projectV2: {
      readonly basicInfo: {
        readonly name: string;
      };
    } | null | undefined;
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
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "projectId",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "concreteType": "ProjectV2",
          "kind": "LinkedField",
          "name": "projectV2",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "ProjectBasicInfo",
              "kind": "LinkedField",
              "name": "basicInfo",
              "plural": false,
              "selections": [
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "name",
                  "storageKey": null
                }
              ],
              "storageKey": null
            }
          ],
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

(node as any).hash = "323589a671e03a55fd84e3bf7f8183d7";

export default node;

/**
 * @generated SignedSource<<6d17bc7eed517b355dc9aba3f5bbcb51>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type DeploymentVllmMetricsButton_deployment$data = {
  readonly currentRevision: {
    readonly modelRuntimeConfig: {
      readonly runtimeVariant: {
        readonly name: string;
      } | null | undefined;
    };
  } | null | undefined;
  readonly id: string;
  readonly " $fragmentType": "DeploymentVllmMetricsButton_deployment";
};
export type DeploymentVllmMetricsButton_deployment$key = {
  readonly " $data"?: DeploymentVllmMetricsButton_deployment$data;
  readonly " $fragmentSpreads": FragmentRefs<"DeploymentVllmMetricsButton_deployment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DeploymentVllmMetricsButton_deployment",
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
      "concreteType": "ModelRevision",
      "kind": "LinkedField",
      "name": "currentRevision",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "ModelRuntimeConfig",
          "kind": "LinkedField",
          "name": "modelRuntimeConfig",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "RuntimeVariant",
              "kind": "LinkedField",
              "name": "runtimeVariant",
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
    }
  ],
  "type": "ModelDeployment",
  "abstractKey": null
};

(node as any).hash = "e871b157d1f08099e95b70cfe8c66703";

export default node;

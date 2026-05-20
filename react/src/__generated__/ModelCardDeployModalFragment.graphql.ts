/**
 * @generated SignedSource<<2e95fe37ba3c51a25c81d5a9b06dfbca>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ModelCardDeployModalFragment$data = {
  readonly availablePresets: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly name: string;
        readonly runtimeVariantId: string;
        readonly " $fragmentSpreads": FragmentRefs<"DeploymentPresetDetailModalFragment">;
      };
    }>;
  } | null | undefined;
  readonly id: string;
  readonly " $fragmentType": "ModelCardDeployModalFragment";
};
export type ModelCardDeployModalFragment$key = {
  readonly " $data"?: ModelCardDeployModalFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"ModelCardDeployModalFragment">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ModelCardDeployModalFragment",
  "selections": [
    (v0/*: any*/),
    {
      "alias": null,
      "args": [
        {
          "kind": "Literal",
          "name": "orderBy",
          "value": [
            {
              "direction": "ASC",
              "field": "RANK"
            }
          ]
        }
      ],
      "concreteType": "DeploymentRevisionPresetConnection",
      "kind": "LinkedField",
      "name": "availablePresets",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "DeploymentRevisionPresetEdge",
          "kind": "LinkedField",
          "name": "edges",
          "plural": true,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "DeploymentRevisionPreset",
              "kind": "LinkedField",
              "name": "node",
              "plural": false,
              "selections": [
                (v0/*: any*/),
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "name",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "runtimeVariantId",
                  "storageKey": null
                },
                {
                  "args": null,
                  "kind": "FragmentSpread",
                  "name": "DeploymentPresetDetailModalFragment"
                }
              ],
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": "availablePresets(orderBy:[{\"direction\":\"ASC\",\"field\":\"RANK\"}])"
    }
  ],
  "type": "ModelCardV2",
  "abstractKey": null
};
})();

(node as any).hash = "59149a747da6a659eb4b7c126a6d89aa";

export default node;

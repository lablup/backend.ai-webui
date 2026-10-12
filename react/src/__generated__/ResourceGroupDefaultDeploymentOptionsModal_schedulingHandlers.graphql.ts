/**
 * @generated SignedSource<<7c84a3029015d0d1ddc5ee55ba973c0d>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ResourceGroupDefaultDeploymentOptionsModal_schedulingHandlers$data = {
  readonly schedulingHandlers: ReadonlyArray<{
    readonly description: string | null | undefined;
    readonly name: string;
  }> | null | undefined;
  readonly " $fragmentType": "ResourceGroupDefaultDeploymentOptionsModal_schedulingHandlers";
};
export type ResourceGroupDefaultDeploymentOptionsModal_schedulingHandlers$key = {
  readonly " $data"?: ResourceGroupDefaultDeploymentOptionsModal_schedulingHandlers$data;
  readonly " $fragmentSpreads": FragmentRefs<"ResourceGroupDefaultDeploymentOptionsModal_schedulingHandlers">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ResourceGroupDefaultDeploymentOptionsModal_schedulingHandlers",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "SchedulingHandlerNode",
      "kind": "LinkedField",
      "name": "schedulingHandlers",
      "plural": true,
      "selections": [
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
          "name": "description",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Query",
  "abstractKey": null
};

(node as any).hash = "ee19ba65aa2071cf0451f69b840cf161";

export default node;

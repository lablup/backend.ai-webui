/**
 * @generated SignedSource<<7d4b6f850ae77f304896351689a1f6d1>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ResourceGroupDefaultDeploymentOptionsModal_options$data = {
  readonly handlerOptions: {
    readonly byHandler: ReadonlyArray<{
      readonly handlerName: string;
      readonly maxRetryCount: number | null | undefined;
      readonly timeoutSec: number | null | undefined;
    }>;
    readonly default: {
      readonly maxRetryCount: number | null | undefined;
      readonly timeoutSec: number | null | undefined;
    };
  };
  readonly " $fragmentType": "ResourceGroupDefaultDeploymentOptionsModal_options";
};
export type ResourceGroupDefaultDeploymentOptionsModal_options$key = {
  readonly " $data"?: ResourceGroupDefaultDeploymentOptionsModal_options$data;
  readonly " $fragmentSpreads": FragmentRefs<"ResourceGroupDefaultDeploymentOptionsModal_options">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "timeoutSec",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "maxRetryCount",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ResourceGroupDefaultDeploymentOptionsModal_options",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "DeploymentHandlerOptionsInfo",
      "kind": "LinkedField",
      "name": "handlerOptions",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "HandlerOptionsInfo",
          "kind": "LinkedField",
          "name": "default",
          "plural": false,
          "selections": [
            (v0/*: any*/),
            (v1/*: any*/)
          ],
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "concreteType": "HandlerOptionsEntryInfo",
          "kind": "LinkedField",
          "name": "byHandler",
          "plural": true,
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "handlerName",
              "storageKey": null
            },
            (v0/*: any*/),
            (v1/*: any*/)
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "DeploymentOptionsInfo",
  "abstractKey": null
};
})();

(node as any).hash = "24576b773c5b0cfd7b17bd31b1968438";

export default node;

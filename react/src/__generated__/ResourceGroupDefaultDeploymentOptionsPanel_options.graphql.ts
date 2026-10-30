/**
 * @generated SignedSource<<29c251f0a8ad0eec0988cd30cbad6e82>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ResourceGroupDefaultDeploymentOptionsPanel_options$data = {
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
  readonly " $fragmentType": "ResourceGroupDefaultDeploymentOptionsPanel_options";
};
export type ResourceGroupDefaultDeploymentOptionsPanel_options$key = {
  readonly " $data"?: ResourceGroupDefaultDeploymentOptionsPanel_options$data;
  readonly " $fragmentSpreads": FragmentRefs<"ResourceGroupDefaultDeploymentOptionsPanel_options">;
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
  "name": "ResourceGroupDefaultDeploymentOptionsPanel_options",
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

(node as any).hash = "3258a2a8639302964e84d9420965c9f5";

export default node;

/**
 * @generated SignedSource<<5750fb44bc625861395df942078fb609>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type TerminateSessionModalV2Fragment$data = ReadonlyArray<{
  readonly id: string;
  readonly kernels: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly resource: {
          readonly agentId: string | null | undefined;
          readonly containerId: string | null | undefined;
        };
      };
    }>;
  } | null | undefined;
  readonly metadata: {
    readonly name: string;
  };
  readonly " $fragmentType": "TerminateSessionModalV2Fragment";
}>;
export type TerminateSessionModalV2Fragment$key = ReadonlyArray<{
  readonly " $data"?: TerminateSessionModalV2Fragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"TerminateSessionModalV2Fragment">;
}>;

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
  "metadata": {
    "plural": true
  },
  "name": "TerminateSessionModalV2Fragment",
  "selections": [
    (v0/*: any*/),
    {
      "alias": null,
      "args": null,
      "concreteType": "SessionV2MetadataInfo",
      "kind": "LinkedField",
      "name": "metadata",
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
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "KernelV2Connection",
      "kind": "LinkedField",
      "name": "kernels",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "KernelV2Edge",
          "kind": "LinkedField",
          "name": "edges",
          "plural": true,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "KernelV2",
              "kind": "LinkedField",
              "name": "node",
              "plural": false,
              "selections": [
                (v0/*: any*/),
                {
                  "alias": null,
                  "args": null,
                  "concreteType": "KernelV2ResourceInfo",
                  "kind": "LinkedField",
                  "name": "resource",
                  "plural": false,
                  "selections": [
                    {
                      "alias": null,
                      "args": null,
                      "kind": "ScalarField",
                      "name": "agentId",
                      "storageKey": null
                    },
                    {
                      "alias": null,
                      "args": null,
                      "kind": "ScalarField",
                      "name": "containerId",
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
      "storageKey": null
    }
  ],
  "type": "SessionV2",
  "abstractKey": null
};
})();

(node as any).hash = "f74f81e34384b45e3c3bb26b4843e680";

export default node;

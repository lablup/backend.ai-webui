/**
 * @generated SignedSource<<7428454ebd5d93639e71b926767463a7>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type useSessionNodeLiveStatSessionFragment$data = {
  readonly id: string;
  readonly kernel_nodes: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly cluster_role: string | null | undefined;
        readonly live_stat: string | null | undefined;
      } | null | undefined;
    } | null | undefined>;
  } | null | undefined;
  readonly " $fragmentType": "useSessionNodeLiveStatSessionFragment";
};
export type useSessionNodeLiveStatSessionFragment$key = {
  readonly " $data"?: useSessionNodeLiveStatSessionFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"useSessionNodeLiveStatSessionFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "useSessionNodeLiveStatSessionFragment",
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
      "concreteType": "KernelConnection",
      "kind": "LinkedField",
      "name": "kernel_nodes",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "KernelEdge",
          "kind": "LinkedField",
          "name": "edges",
          "plural": true,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "KernelNode",
              "kind": "LinkedField",
              "name": "node",
              "plural": false,
              "selections": [
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "live_stat",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "cluster_role",
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
  "type": "ComputeSessionNode",
  "abstractKey": null
};

(node as any).hash = "a7520fc1649218c4993de42578f73b02";

export default node;

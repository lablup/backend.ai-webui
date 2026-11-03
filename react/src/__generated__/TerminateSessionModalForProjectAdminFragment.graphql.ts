/**
 * @generated SignedSource<<6fc2eec9d01d48fe36ca4876dcdae98d>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type TerminateSessionModalForProjectAdminFragment$data = ReadonlyArray<{
  readonly entityId: string;
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
  readonly " $fragmentType": "TerminateSessionModalForProjectAdminFragment";
}>;
export type TerminateSessionModalForProjectAdminFragment$key = ReadonlyArray<{
  readonly " $data"?: TerminateSessionModalForProjectAdminFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"TerminateSessionModalForProjectAdminFragment">;
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
  "name": "TerminateSessionModalForProjectAdminFragment",
  "selections": [
    (v0/*: any*/),
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

(node as any).hash = "7012eaf26b1804672778ddb998dd1c1e";

export default node;

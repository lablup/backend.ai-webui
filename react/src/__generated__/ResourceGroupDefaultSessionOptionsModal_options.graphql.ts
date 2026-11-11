/**
 * @generated SignedSource<<aa04e87ce182e645dd03a649f8730bc0>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type SessionAgentSelectionPolicy = "PREFERRED" | "STRICT" | "%future added value";
export type SessionFailurePolicy = "BOOT_ALL" | "STRICT" | "TOLERANT" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type ResourceGroupDefaultSessionOptionsModal_options$data = {
  readonly agentSelectionPolicy: SessionAgentSelectionPolicy;
  readonly clusterMode: string;
  readonly defaultFailurePolicy: SessionFailurePolicy;
  readonly defaultKernelExecutionSpec: {
    readonly batchTimeoutSec: number | null | undefined;
    readonly bootstrapScript: string | null | undefined;
    readonly imageId: string | null | undefined;
    readonly resourceOpts: {
      readonly shmem: string | null | undefined;
    } | null | undefined;
    readonly resources: ReadonlyArray<{
      readonly quantity: any;
      readonly resourceType: string;
    }> | null | undefined;
    readonly startsAt: string | null | undefined;
    readonly startupCommand: string | null | undefined;
  } | null | undefined;
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
  readonly isPreemptible: boolean;
  readonly priority: number;
  readonly " $fragmentType": "ResourceGroupDefaultSessionOptionsModal_options";
};
export type ResourceGroupDefaultSessionOptionsModal_options$key = {
  readonly " $data"?: ResourceGroupDefaultSessionOptionsModal_options$data;
  readonly " $fragmentSpreads": FragmentRefs<"ResourceGroupDefaultSessionOptionsModal_options">;
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
  "name": "ResourceGroupDefaultSessionOptionsModal_options",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "priority",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "isPreemptible",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "clusterMode",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "defaultFailurePolicy",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "agentSelectionPolicy",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "DefaultSessionHandlerOptionsPolicyInfo",
      "kind": "LinkedField",
      "name": "handlerOptions",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "DefaultSessionHandlerOptionsInfo",
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
          "concreteType": "DefaultSessionHandlerOptionsEntryInfo",
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
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "DefaultSessionKernelExecutionSpecInfo",
      "kind": "LinkedField",
      "name": "defaultKernelExecutionSpec",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "imageId",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "concreteType": "ResourceSlotEntry",
          "kind": "LinkedField",
          "name": "resources",
          "plural": true,
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "resourceType",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "quantity",
              "storageKey": null
            }
          ],
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "concreteType": "DefaultSessionResourceOptsInfo",
          "kind": "LinkedField",
          "name": "resourceOpts",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "shmem",
              "storageKey": null
            }
          ],
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "startupCommand",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "bootstrapScript",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "startsAt",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "batchTimeoutSec",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "DefaultSessionOptionsInfo",
  "abstractKey": null
};
})();

(node as any).hash = "1c892d7f9fa8b9da9da23b0950a04368";

export default node;

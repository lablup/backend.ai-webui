/**
 * @generated SignedSource<<b8074b483ca7e13610a1bae00470ad90>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SessionAgentSelectionPolicy = "PREFERRED" | "STRICT" | "%future added value";
export type SessionFailurePolicy = "BOOT_ALL" | "STRICT" | "TOLERANT" | "%future added value";
export type ReplaceResourceGroupDefaultSessionOptionsInput = {
  options: DefaultSessionOptionsInput;
  resourceGroupName: string;
};
export type DefaultSessionOptionsInput = {
  agentSelectionPolicy?: SessionAgentSelectionPolicy | null | undefined;
  clusterMode?: string | null | undefined;
  defaultFailurePolicy?: SessionFailurePolicy | null | undefined;
  defaultKernelExecutionSpec?: DefaultSessionKernelExecutionSpecInput | null | undefined;
  handlerOptions?: DefaultSessionHandlerOptionsPolicyInput | null | undefined;
  isPreemptible?: boolean | null | undefined;
  priority?: number | null | undefined;
};
export type DefaultSessionKernelExecutionSpecInput = {
  batchTimeoutSec?: number | null | undefined;
  bootstrapScript?: string | null | undefined;
  imageId?: string | null | undefined;
  resourceOpts?: DefaultSessionResourceOptsInput | null | undefined;
  resources?: ReadonlyArray<ResourceSlotEntryInput> | null | undefined;
  startsAt?: string | null | undefined;
  startupCommand?: string | null | undefined;
};
export type ResourceSlotEntryInput = {
  quantity: string;
  resourceType: string;
};
export type DefaultSessionResourceOptsInput = {
  shmem?: BinarySizeInput | null | undefined;
};
export type BinarySizeInput = {
  expr: string;
};
export type DefaultSessionHandlerOptionsPolicyInput = {
  byHandler?: ReadonlyArray<DefaultSessionHandlerOptionsEntryInput> | null | undefined;
  default?: DefaultSessionHandlerOptionsInput | null | undefined;
};
export type DefaultSessionHandlerOptionsInput = {
  maxRetryCount?: number | null | undefined;
  timeoutSec?: number | null | undefined;
};
export type DefaultSessionHandlerOptionsEntryInput = {
  handlerName: string;
  maxRetryCount?: number | null | undefined;
  timeoutSec?: number | null | undefined;
};
export type ResourceGroupDefaultSessionOptionsModalMutation$variables = {
  input: ReplaceResourceGroupDefaultSessionOptionsInput;
};
export type ResourceGroupDefaultSessionOptionsModalMutation$data = {
  readonly replaceResourceGroupDefaultSessionOptions: {
    readonly defaultSessionOptions: {
      readonly " $fragmentSpreads": FragmentRefs<"ResourceGroupDefaultSessionOptionsModal_options" | "ResourceGroupDefaultSessionOptionsPanel_options">;
    };
  } | null | undefined;
};
export type ResourceGroupDefaultSessionOptionsModalMutation = {
  response: ResourceGroupDefaultSessionOptionsModalMutation$data;
  variables: ResourceGroupDefaultSessionOptionsModalMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "input",
    "variableName": "input"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "timeoutSec",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "maxRetryCount",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "ResourceGroupDefaultSessionOptionsModalMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "ReplaceResourceGroupDefaultSessionOptionsPayload",
        "kind": "LinkedField",
        "name": "replaceResourceGroupDefaultSessionOptions",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "DefaultSessionOptionsInfo",
            "kind": "LinkedField",
            "name": "defaultSessionOptions",
            "plural": false,
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "ResourceGroupDefaultSessionOptionsPanel_options"
              },
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "ResourceGroupDefaultSessionOptionsModal_options"
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ResourceGroupDefaultSessionOptionsModalMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "ReplaceResourceGroupDefaultSessionOptionsPayload",
        "kind": "LinkedField",
        "name": "replaceResourceGroupDefaultSessionOptions",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "DefaultSessionOptionsInfo",
            "kind": "LinkedField",
            "name": "defaultSessionOptions",
            "plural": false,
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
                      (v2/*: any*/),
                      (v3/*: any*/)
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
                      (v2/*: any*/),
                      (v3/*: any*/)
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
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "045aacce6cc263c61c32a1d7782fd36d",
    "id": null,
    "metadata": {},
    "name": "ResourceGroupDefaultSessionOptionsModalMutation",
    "operationKind": "mutation",
    "text": "mutation ResourceGroupDefaultSessionOptionsModalMutation(\n  $input: ReplaceResourceGroupDefaultSessionOptionsInput!\n) {\n  replaceResourceGroupDefaultSessionOptions(input: $input) {\n    defaultSessionOptions {\n      ...ResourceGroupDefaultSessionOptionsPanel_options\n      ...ResourceGroupDefaultSessionOptionsModal_options\n    }\n  }\n}\n\nfragment ResourceGroupDefaultSessionOptionsModal_options on DefaultSessionOptionsInfo {\n  priority\n  isPreemptible\n  clusterMode\n  defaultFailurePolicy\n  agentSelectionPolicy\n  handlerOptions {\n    default {\n      timeoutSec\n      maxRetryCount\n    }\n    byHandler {\n      handlerName\n      timeoutSec\n      maxRetryCount\n    }\n  }\n  defaultKernelExecutionSpec {\n    imageId\n    resources {\n      resourceType\n      quantity\n    }\n    resourceOpts {\n      shmem\n    }\n    startupCommand\n    bootstrapScript\n    startsAt\n    batchTimeoutSec\n  }\n}\n\nfragment ResourceGroupDefaultSessionOptionsPanel_options on DefaultSessionOptionsInfo {\n  priority\n  isPreemptible\n  clusterMode\n  defaultFailurePolicy\n  agentSelectionPolicy\n  handlerOptions {\n    default {\n      timeoutSec\n      maxRetryCount\n    }\n    byHandler {\n      handlerName\n      timeoutSec\n      maxRetryCount\n    }\n  }\n  defaultKernelExecutionSpec {\n    imageId\n    resources {\n      resourceType\n      quantity\n    }\n    resourceOpts {\n      shmem\n    }\n    startupCommand\n    bootstrapScript\n    startsAt\n    batchTimeoutSec\n  }\n}\n"
  }
};
})();

(node as any).hash = "9e4ad6a6a1f9b7b4cd582323d98ada6a";

export default node;

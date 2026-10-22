/**
 * @generated SignedSource<<9f46cee25ff0a5fc3fab7fad6d9494f2>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ReplaceResourceGroupDefaultDeploymentOptionsInput = {
  options: DeploymentOptionsInput;
  resourceGroupName: string;
};
export type DeploymentOptionsInput = {
  handlerOptions: DeploymentHandlerOptionsInput;
};
export type DeploymentHandlerOptionsInput = {
  byHandler?: ReadonlyArray<HandlerOptionsEntryInput> | null | undefined;
  default?: HandlerOptionsInput | null | undefined;
};
export type HandlerOptionsInput = {
  maxRetryCount?: number | null | undefined;
  timeoutSec?: number | null | undefined;
};
export type HandlerOptionsEntryInput = {
  handlerName: string;
  maxRetryCount?: number | null | undefined;
  timeoutSec?: number | null | undefined;
};
export type ResourceGroupDefaultDeploymentOptionsModalMutation$variables = {
  input: ReplaceResourceGroupDefaultDeploymentOptionsInput;
};
export type ResourceGroupDefaultDeploymentOptionsModalMutation$data = {
  readonly replaceResourceGroupDefaultDeploymentOptions: {
    readonly defaultDeploymentOptions: {
      readonly " $fragmentSpreads": FragmentRefs<"ResourceGroupDefaultDeploymentOptionsModal_options" | "ResourceGroupDefaultDeploymentOptionsPanel_options">;
    };
  } | null | undefined;
};
export type ResourceGroupDefaultDeploymentOptionsModalMutation = {
  response: ResourceGroupDefaultDeploymentOptionsModalMutation$data;
  variables: ResourceGroupDefaultDeploymentOptionsModalMutation$variables;
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
    "name": "ResourceGroupDefaultDeploymentOptionsModalMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "ReplaceResourceGroupDefaultDeploymentOptionsPayload",
        "kind": "LinkedField",
        "name": "replaceResourceGroupDefaultDeploymentOptions",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "DeploymentOptionsInfo",
            "kind": "LinkedField",
            "name": "defaultDeploymentOptions",
            "plural": false,
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "ResourceGroupDefaultDeploymentOptionsPanel_options"
              },
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "ResourceGroupDefaultDeploymentOptionsModal_options"
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
    "name": "ResourceGroupDefaultDeploymentOptionsModalMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "ReplaceResourceGroupDefaultDeploymentOptionsPayload",
        "kind": "LinkedField",
        "name": "replaceResourceGroupDefaultDeploymentOptions",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "DeploymentOptionsInfo",
            "kind": "LinkedField",
            "name": "defaultDeploymentOptions",
            "plural": false,
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
                      (v2/*: any*/),
                      (v3/*: any*/)
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
                      (v2/*: any*/),
                      (v3/*: any*/)
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
    ]
  },
  "params": {
    "cacheID": "00847cff6d9a6754cf3fd4e47d3e48c7",
    "id": null,
    "metadata": {},
    "name": "ResourceGroupDefaultDeploymentOptionsModalMutation",
    "operationKind": "mutation",
    "text": "mutation ResourceGroupDefaultDeploymentOptionsModalMutation(\n  $input: ReplaceResourceGroupDefaultDeploymentOptionsInput!\n) {\n  replaceResourceGroupDefaultDeploymentOptions(input: $input) {\n    defaultDeploymentOptions {\n      ...ResourceGroupDefaultDeploymentOptionsPanel_options\n      ...ResourceGroupDefaultDeploymentOptionsModal_options\n    }\n  }\n}\n\nfragment ResourceGroupDefaultDeploymentOptionsModal_options on DeploymentOptionsInfo {\n  handlerOptions {\n    default {\n      timeoutSec\n      maxRetryCount\n    }\n    byHandler {\n      handlerName\n      timeoutSec\n      maxRetryCount\n    }\n  }\n}\n\nfragment ResourceGroupDefaultDeploymentOptionsPanel_options on DeploymentOptionsInfo {\n  handlerOptions {\n    default {\n      timeoutSec\n      maxRetryCount\n    }\n    byHandler {\n      handlerName\n      timeoutSec\n      maxRetryCount\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "31ac1bbb716a5992e8240a1965eab126";

export default node;

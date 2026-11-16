/**
 * @generated SignedSource<<08f3b64a7e38b844acf8f4827bf398b1>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { Result } from "relay-runtime";
export type WebUIAssistantProvisionerQuery$variables = {
  id: string;
};
export type WebUIAssistantProvisionerQuery$data = {
  readonly deployment: Result<{
    readonly id: string;
    readonly networkAccess: {
      readonly endpointUrl: string | null | undefined;
    };
  } | null | undefined, unknown>;
};
export type WebUIAssistantProvisionerQuery = {
  response: WebUIAssistantProvisionerQuery$data;
  variables: WebUIAssistantProvisionerQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = {
  "alias": null,
  "args": [
    {
      "kind": "Variable",
      "name": "id",
      "variableName": "id"
    }
  ],
  "concreteType": "ModelDeployment",
  "kind": "LinkedField",
  "name": "deployment",
  "plural": false,
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
      "concreteType": "ModelDeploymentNetworkAccess",
      "kind": "LinkedField",
      "name": "networkAccess",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "endpointUrl",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "WebUIAssistantProvisionerQuery",
    "selections": [
      {
        "kind": "CatchField",
        "field": (v1/*: any*/),
        "to": "RESULT"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "WebUIAssistantProvisionerQuery",
    "selections": [
      (v1/*: any*/)
    ]
  },
  "params": {
    "cacheID": "9126f5902dfddde6ec17c4160996be30",
    "id": null,
    "metadata": {},
    "name": "WebUIAssistantProvisionerQuery",
    "operationKind": "query",
    "text": "query WebUIAssistantProvisionerQuery(\n  $id: ID!\n) {\n  deployment(id: $id) {\n    id\n    networkAccess {\n      endpointUrl\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "89089037c1344560f8ea9c4488f317bb";

export default node;

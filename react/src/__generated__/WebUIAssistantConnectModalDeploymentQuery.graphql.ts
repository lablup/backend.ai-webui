/**
 * @generated SignedSource<<62c0f73a08407c6c79678be43d92e44a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { Result } from "relay-runtime";
export type WebUIAssistantConnectModalDeploymentQuery$variables = {
  id: string;
};
export type WebUIAssistantConnectModalDeploymentQuery$data = {
  readonly deployment: Result<{
    readonly networkAccess: {
      readonly endpointUrl: string | null | undefined;
    };
  } | null | undefined, unknown>;
};
export type WebUIAssistantConnectModalDeploymentQuery = {
  response: WebUIAssistantConnectModalDeploymentQuery$data;
  variables: WebUIAssistantConnectModalDeploymentQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
],
v2 = {
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
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "WebUIAssistantConnectModalDeploymentQuery",
    "selections": [
      {
        "kind": "CatchField",
        "field": {
          "alias": null,
          "args": (v1/*: any*/),
          "concreteType": "ModelDeployment",
          "kind": "LinkedField",
          "name": "deployment",
          "plural": false,
          "selections": [
            (v2/*: any*/)
          ],
          "storageKey": null
        },
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
    "name": "WebUIAssistantConnectModalDeploymentQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "ModelDeployment",
        "kind": "LinkedField",
        "name": "deployment",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "2b646462a0168045df889a8d9265bc73",
    "id": null,
    "metadata": {},
    "name": "WebUIAssistantConnectModalDeploymentQuery",
    "operationKind": "query",
    "text": "query WebUIAssistantConnectModalDeploymentQuery(\n  $id: ID!\n) {\n  deployment(id: $id) {\n    networkAccess {\n      endpointUrl\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "ef062b9b7948a0f98c946b8c961b3857";

export default node;

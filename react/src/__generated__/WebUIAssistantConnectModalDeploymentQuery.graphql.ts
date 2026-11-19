/**
 * @generated SignedSource<<f87c2a58c35359a07182ba56fd1bf78c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { Result } from "relay-runtime";
export type DeploymentStatus = "DEPLOYING" | "PENDING" | "READY" | "SCALING" | "STOPPED" | "STOPPING" | "%future added value";
export type WebUIAssistantConnectModalDeploymentQuery$variables = {
  id: string;
};
export type WebUIAssistantConnectModalDeploymentQuery$data = {
  readonly deployment: Result<{
    readonly metadata: {
      readonly name: string;
      readonly status: DeploymentStatus;
    };
    readonly networkAccess: {
      readonly endpointUrl: string | null | undefined;
      readonly openToPublic: boolean;
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
  "concreteType": "ModelDeploymentMetadata",
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
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "status",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v3 = {
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
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "openToPublic",
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
            (v2/*: any*/),
            (v3/*: any*/)
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
          (v3/*: any*/),
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
    "cacheID": "ead5e9908395e04f98fda9b91d804d5b",
    "id": null,
    "metadata": {},
    "name": "WebUIAssistantConnectModalDeploymentQuery",
    "operationKind": "query",
    "text": "query WebUIAssistantConnectModalDeploymentQuery(\n  $id: ID!\n) {\n  deployment(id: $id) {\n    metadata {\n      name\n      status\n    }\n    networkAccess {\n      endpointUrl\n      openToPublic\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "42d1de6e214c4300013093ed366552b9";

export default node;

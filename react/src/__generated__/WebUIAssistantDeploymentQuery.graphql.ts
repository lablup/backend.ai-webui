/**
 * @generated SignedSource<<46d5e24c2f6e8fd9d76a6a33b61a2722>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type DeploymentStatus = "DEPLOYING" | "PENDING" | "READY" | "SCALING" | "STOPPED" | "STOPPING" | "%future added value";
export type WebUIAssistantDeploymentQuery$variables = {
  id: string;
};
export type WebUIAssistantDeploymentQuery$data = {
  readonly deployment: {
    readonly id: string;
    readonly metadata: {
      readonly status: DeploymentStatus;
    };
  } | null | undefined;
};
export type WebUIAssistantDeploymentQuery = {
  response: WebUIAssistantDeploymentQuery$data;
  variables: WebUIAssistantDeploymentQuery$variables;
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
        "concreteType": "ModelDeploymentMetadata",
        "kind": "LinkedField",
        "name": "metadata",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "status",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "WebUIAssistantDeploymentQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "WebUIAssistantDeploymentQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "4a867a9d13de706cc56b76b9adfef424",
    "id": null,
    "metadata": {},
    "name": "WebUIAssistantDeploymentQuery",
    "operationKind": "query",
    "text": "query WebUIAssistantDeploymentQuery(\n  $id: ID!\n) {\n  deployment(id: $id) {\n    id\n    metadata {\n      status\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "99599948ef25090ccda8dc64ff58e004";

export default node;

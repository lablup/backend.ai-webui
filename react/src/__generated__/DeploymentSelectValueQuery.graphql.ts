/**
 * @generated SignedSource<<48d2217c91c32a7505791a5f19db3bf6>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type DeploymentSelectValueQuery$variables = {
  deploymentId: string;
};
export type DeploymentSelectValueQuery$data = {
  readonly deployment: {
    readonly id: string;
    readonly metadata: {
      readonly name: string;
    };
    readonly networkAccess: {
      readonly endpointUrl: string | null | undefined;
    };
  } | null | undefined;
};
export type DeploymentSelectValueQuery = {
  response: DeploymentSelectValueQuery$data;
  variables: DeploymentSelectValueQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "deploymentId"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "id",
        "variableName": "deploymentId"
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
            "name": "name",
            "storageKey": null
          }
        ],
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
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "DeploymentSelectValueQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "DeploymentSelectValueQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "d019233e2b61cf4c5de6d4201a9241e1",
    "id": null,
    "metadata": {},
    "name": "DeploymentSelectValueQuery",
    "operationKind": "query",
    "text": "query DeploymentSelectValueQuery(\n  $deploymentId: ID!\n) {\n  deployment(id: $deploymentId) {\n    id\n    metadata {\n      name\n    }\n    networkAccess {\n      endpointUrl\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "216367ded2e494bc626f4baba302eced";

export default node;

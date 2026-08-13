/**
 * @generated SignedSource<<6be9845aadfdb54deba78d145c388aa6>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type DeploymentSelectAstryxValueQuery$variables = {
  deploymentId: string;
};
export type DeploymentSelectAstryxValueQuery$data = {
  readonly deployment: {
    readonly id: string;
    readonly metadata: {
      readonly name: string;
      readonly projectId: string;
    };
  } | null | undefined;
};
export type DeploymentSelectAstryxValueQuery = {
  response: DeploymentSelectAstryxValueQuery$data;
  variables: DeploymentSelectAstryxValueQuery$variables;
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
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "projectId",
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
    "name": "DeploymentSelectAstryxValueQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "DeploymentSelectAstryxValueQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "5c8e5a6dc89f38b604febf637bcbc251",
    "id": null,
    "metadata": {},
    "name": "DeploymentSelectAstryxValueQuery",
    "operationKind": "query",
    "text": "query DeploymentSelectAstryxValueQuery(\n  $deploymentId: ID!\n) {\n  deployment(id: $deploymentId) {\n    id\n    metadata {\n      name\n      projectId\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "4595aec6dbdd232288c92b217a0952ac";

export default node;

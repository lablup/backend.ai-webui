/**
 * @generated SignedSource<<a63639923052d48f0b06597990367785>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type DeploymentAccessTokensCardTestQuery$variables = {
  deploymentId: string;
};
export type DeploymentAccessTokensCardTestQuery$data = {
  readonly deployment: {
    readonly " $fragmentSpreads": FragmentRefs<"DeploymentAccessTokensCard_deployment">;
  } | null | undefined;
};
export type DeploymentAccessTokensCardTestQuery = {
  response: DeploymentAccessTokensCardTestQuery$data;
  variables: DeploymentAccessTokensCardTestQuery$variables;
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
    "kind": "Variable",
    "name": "id",
    "variableName": "deploymentId"
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "DeploymentAccessTokensCardTestQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "ModelDeployment",
        "kind": "LinkedField",
        "name": "deployment",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "DeploymentAccessTokensCard_deployment"
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "DeploymentAccessTokensCardTestQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
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
            "kind": "ScalarField",
            "name": "entityId",
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
    ]
  },
  "params": {
    "cacheID": "a4cf648a7b763f43fbb3df15d185c07a",
    "id": null,
    "metadata": {},
    "name": "DeploymentAccessTokensCardTestQuery",
    "operationKind": "query",
    "text": "query DeploymentAccessTokensCardTestQuery(\n  $deploymentId: ID!\n) {\n  deployment(id: $deploymentId) {\n    ...DeploymentAccessTokensCard_deployment\n    id\n  }\n}\n\nfragment DeploymentAccessTokensCard_deployment on ModelDeployment {\n  id\n  entityId\n  networkAccess {\n    endpointUrl\n  }\n}\n"
  }
};
})();

(node as any).hash = "06aa929b7c3569fcb44443a42e8bf7bb";

export default node;

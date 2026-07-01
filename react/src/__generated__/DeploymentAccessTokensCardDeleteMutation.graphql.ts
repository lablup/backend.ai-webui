/**
 * @generated SignedSource<<6c8f2878181d310c69c5ad61ce2cd280>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type DeleteAccessTokenInput = {
  id: string;
};
export type DeploymentAccessTokensCardDeleteMutation$variables = {
  input: DeleteAccessTokenInput;
};
export type DeploymentAccessTokensCardDeleteMutation$data = {
  readonly deleteAccessToken: {
    readonly id: string;
  } | null | undefined;
};
export type DeploymentAccessTokensCardDeleteMutation = {
  response: DeploymentAccessTokensCardDeleteMutation$data;
  variables: DeploymentAccessTokensCardDeleteMutation$variables;
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
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "DeleteAccessTokenPayload",
    "kind": "LinkedField",
    "name": "deleteAccessToken",
    "plural": false,
    "selections": [
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
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "DeploymentAccessTokensCardDeleteMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "DeploymentAccessTokensCardDeleteMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "3001cf022c16a198843b296bca8e75f9",
    "id": null,
    "metadata": {},
    "name": "DeploymentAccessTokensCardDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation DeploymentAccessTokensCardDeleteMutation(\n  $input: DeleteAccessTokenInput!\n) {\n  deleteAccessToken(input: $input) {\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "6877559748beeee076979bb65393d59f";

export default node;

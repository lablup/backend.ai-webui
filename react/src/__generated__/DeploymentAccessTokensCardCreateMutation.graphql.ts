/**
 * @generated SignedSource<<efc579018c3c9b15dcf903f727d6b4d5>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type CreateAccessTokenInput = {
  expiresAt: string;
  modelDeploymentId: string;
};
export type DeploymentAccessTokensCardCreateMutation$variables = {
  input: CreateAccessTokenInput;
};
export type DeploymentAccessTokensCardCreateMutation$data = {
  readonly createAccessToken: {
    readonly accessToken: {
      readonly createdAt: string;
      readonly expiresAt: string | null | undefined;
      readonly id: string;
      readonly token: string;
    };
  } | null | undefined;
};
export type DeploymentAccessTokensCardCreateMutation = {
  response: DeploymentAccessTokensCardCreateMutation$data;
  variables: DeploymentAccessTokensCardCreateMutation$variables;
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
    "concreteType": "CreateAccessTokenPayload",
    "kind": "LinkedField",
    "name": "createAccessToken",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "AccessToken",
        "kind": "LinkedField",
        "name": "accessToken",
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
            "name": "token",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "createdAt",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "expiresAt",
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
    "name": "DeploymentAccessTokensCardCreateMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "DeploymentAccessTokensCardCreateMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "8c08238f7222fe51a04881e736d82b15",
    "id": null,
    "metadata": {},
    "name": "DeploymentAccessTokensCardCreateMutation",
    "operationKind": "mutation",
    "text": "mutation DeploymentAccessTokensCardCreateMutation(\n  $input: CreateAccessTokenInput!\n) {\n  createAccessToken(input: $input) {\n    accessToken {\n      id\n      token\n      createdAt\n      expiresAt\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "4ba926c16e8cf928584ec3a34cde8b34";

export default node;

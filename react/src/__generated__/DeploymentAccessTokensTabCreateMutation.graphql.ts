/**
 * @generated SignedSource<<5f8baaa322e59baa963f6af3524731d1>>
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
export type DeploymentAccessTokensTabCreateMutation$variables = {
  input: CreateAccessTokenInput;
};
export type DeploymentAccessTokensTabCreateMutation$data = {
  readonly createAccessToken: {
    readonly accessToken: {
      readonly createdAt: string;
      readonly expiresAt: string | null | undefined;
      readonly id: string;
      readonly token: string;
    };
  } | null | undefined;
};
export type DeploymentAccessTokensTabCreateMutation = {
  response: DeploymentAccessTokensTabCreateMutation$data;
  variables: DeploymentAccessTokensTabCreateMutation$variables;
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
    "name": "DeploymentAccessTokensTabCreateMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "DeploymentAccessTokensTabCreateMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "ad0b1632c09adadb34c59dfacd183923",
    "id": null,
    "metadata": {},
    "name": "DeploymentAccessTokensTabCreateMutation",
    "operationKind": "mutation",
    "text": "mutation DeploymentAccessTokensTabCreateMutation(\n  $input: CreateAccessTokenInput!\n) {\n  createAccessToken(input: $input) {\n    accessToken {\n      id\n      token\n      createdAt\n      expiresAt\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "df1b417c9205070e2bf82168815c312e";

export default node;

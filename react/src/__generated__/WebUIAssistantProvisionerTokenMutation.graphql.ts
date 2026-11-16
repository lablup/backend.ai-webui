/**
 * @generated SignedSource<<0af82d711a5e1a22025dc8beb6628b88>>
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
export type WebUIAssistantProvisionerTokenMutation$variables = {
  input: CreateAccessTokenInput;
};
export type WebUIAssistantProvisionerTokenMutation$data = {
  readonly createAccessToken: {
    readonly accessToken: {
      readonly token: string;
    };
  } | null | undefined;
};
export type WebUIAssistantProvisionerTokenMutation = {
  response: WebUIAssistantProvisionerTokenMutation$data;
  variables: WebUIAssistantProvisionerTokenMutation$variables;
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
    "kind": "Variable",
    "name": "input",
    "variableName": "input"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "token",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "WebUIAssistantProvisionerTokenMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
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
              (v2/*: any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "WebUIAssistantProvisionerTokenMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
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
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "6c7cc4c6016fb1768a59230b9af1817a",
    "id": null,
    "metadata": {},
    "name": "WebUIAssistantProvisionerTokenMutation",
    "operationKind": "mutation",
    "text": "mutation WebUIAssistantProvisionerTokenMutation(\n  $input: CreateAccessTokenInput!\n) {\n  createAccessToken(input: $input) {\n    accessToken {\n      token\n      id\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "1dd24790620c672022868468dca6e82b";

export default node;

/**
 * @generated SignedSource<<1618f379bde221ec4505b997572a3176>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type DeploymentAccessTokensCardDeleteMutation$variables = {
  id: string;
};
export type DeploymentAccessTokensCardDeleteMutation$data = {
  readonly purgeAccessToken: {
    readonly fieldId: string;
    readonly purgedId: string;
  };
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
    "concreteType": "PurgeAccessTokenPayload",
    "kind": "LinkedField",
    "name": "purgeAccessToken",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "purgedId",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "fieldId",
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
    "cacheID": "aa8098e331a7a0e5febc933a5456c0b8",
    "id": null,
    "metadata": {},
    "name": "DeploymentAccessTokensCardDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation DeploymentAccessTokensCardDeleteMutation(\n  $id: UUID!\n) {\n  purgeAccessToken(id: $id) {\n    purgedId\n    fieldId\n  }\n}\n"
  }
};
})();

(node as any).hash = "4969e332ba8b941d77cd927bb8e7b9b4";

export default node;

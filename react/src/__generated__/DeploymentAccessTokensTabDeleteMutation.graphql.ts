/**
 * @generated SignedSource<<a43045989ee9e8789f10b921113079df>>
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
export type DeploymentAccessTokensTabDeleteMutation$variables = {
  input: DeleteAccessTokenInput;
};
export type DeploymentAccessTokensTabDeleteMutation$data = {
  readonly deleteAccessToken: {
    readonly id: string;
  } | null | undefined;
};
export type DeploymentAccessTokensTabDeleteMutation = {
  response: DeploymentAccessTokensTabDeleteMutation$data;
  variables: DeploymentAccessTokensTabDeleteMutation$variables;
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
    "name": "DeploymentAccessTokensTabDeleteMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "DeploymentAccessTokensTabDeleteMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "a511c067913c62224123dba5853f9c55",
    "id": null,
    "metadata": {},
    "name": "DeploymentAccessTokensTabDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation DeploymentAccessTokensTabDeleteMutation(\n  $input: DeleteAccessTokenInput!\n) {\n  deleteAccessToken(input: $input) {\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "a82f98c3e592ea37497b90c70d69d6b4";

export default node;

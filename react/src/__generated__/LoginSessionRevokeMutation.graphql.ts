/**
 * @generated SignedSource<<6ccbacbed920495dece8b9b5c3393d76>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type LoginSessionRevokeMutation$variables = {
  sessionId: string;
};
export type LoginSessionRevokeMutation$data = {
  readonly myRevokeLoginSession: {
    readonly success: boolean;
  } | null | undefined;
};
export type LoginSessionRevokeMutation = {
  response: LoginSessionRevokeMutation$data;
  variables: LoginSessionRevokeMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "sessionId"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "sessionId",
        "variableName": "sessionId"
      }
    ],
    "concreteType": "RevokeLoginSessionPayload",
    "kind": "LinkedField",
    "name": "myRevokeLoginSession",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "success",
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
    "name": "LoginSessionRevokeMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "LoginSessionRevokeMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "41df35ebbb822fb28cf96d030cc8595e",
    "id": null,
    "metadata": {},
    "name": "LoginSessionRevokeMutation",
    "operationKind": "mutation",
    "text": "mutation LoginSessionRevokeMutation(\n  $sessionId: UUID!\n) {\n  myRevokeLoginSession(sessionId: $sessionId) {\n    success\n  }\n}\n"
  }
};
})();

(node as any).hash = "bfd0aab9f619a61072e04fab314a1b4b";

export default node;

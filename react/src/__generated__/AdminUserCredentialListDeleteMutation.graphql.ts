/**
 * @generated SignedSource<<ec221366bc6ac5ca78e54b3b3a07b6b8>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type AdminUserCredentialListDeleteMutation$variables = {
  accessKey: string;
};
export type AdminUserCredentialListDeleteMutation$data = {
  readonly adminDeleteKeypairV2: {
    readonly accessKey: string;
  } | null | undefined;
};
export type AdminUserCredentialListDeleteMutation = {
  response: AdminUserCredentialListDeleteMutation$data;
  variables: AdminUserCredentialListDeleteMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "accessKey"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "accessKey",
        "variableName": "accessKey"
      }
    ],
    "concreteType": "AdminDeleteKeypairPayload",
    "kind": "LinkedField",
    "name": "adminDeleteKeypairV2",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "accessKey",
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
    "name": "AdminUserCredentialListDeleteMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "AdminUserCredentialListDeleteMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "b51167cef6d60228f92da5565b40b7e3",
    "id": null,
    "metadata": {},
    "name": "AdminUserCredentialListDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation AdminUserCredentialListDeleteMutation(\n  $accessKey: String!\n) {\n  adminDeleteKeypairV2(accessKey: $accessKey) {\n    accessKey\n  }\n}\n"
  }
};
})();

(node as any).hash = "fee9efb0a7d661147bb17fa71a6d0250";

export default node;

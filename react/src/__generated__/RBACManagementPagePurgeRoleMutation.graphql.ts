/**
 * @generated SignedSource<<52cd6452bbb11033b043b540727ca474>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type RBACManagementPagePurgeRoleMutation$variables = {
  id: string;
};
export type RBACManagementPagePurgeRoleMutation$data = {
  readonly purgeRole: {
    readonly purgedId: string;
  };
};
export type RBACManagementPagePurgeRoleMutation = {
  response: RBACManagementPagePurgeRoleMutation$data;
  variables: RBACManagementPagePurgeRoleMutation$variables;
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
    "concreteType": "PurgeRolePayload",
    "kind": "LinkedField",
    "name": "purgeRole",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "purgedId",
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
    "name": "RBACManagementPagePurgeRoleMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RBACManagementPagePurgeRoleMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "feb00ca7d5c319fd8b502834750c791b",
    "id": null,
    "metadata": {},
    "name": "RBACManagementPagePurgeRoleMutation",
    "operationKind": "mutation",
    "text": "mutation RBACManagementPagePurgeRoleMutation(\n  $id: UUID!\n) {\n  purgeRole(id: $id) {\n    purgedId\n  }\n}\n"
  }
};
})();

(node as any).hash = "995e3846851bfb6fad3388c088fa6a04";

export default node;

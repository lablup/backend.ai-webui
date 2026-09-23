/**
 * @generated SignedSource<<f384e0a08a2336aa10a496cf95175fdb>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type RoleFormModalPermissionMatrixQuery$variables = Record<PropertyKey, never>;
export type RoleFormModalPermissionMatrixQuery$data = {
  readonly rbacPermissionMatrix: ReadonlyArray<{
    readonly scopeType: string;
  }> | null | undefined;
};
export type RoleFormModalPermissionMatrixQuery = {
  response: RoleFormModalPermissionMatrixQuery$data;
  variables: RoleFormModalPermissionMatrixQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "ScopeEntityOperationCombination",
    "kind": "LinkedField",
    "name": "rbacPermissionMatrix",
    "plural": true,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "scopeType",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RoleFormModalPermissionMatrixQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RoleFormModalPermissionMatrixQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "3e49acf208c65d7a49ee93149e0d5f79",
    "id": null,
    "metadata": {},
    "name": "RoleFormModalPermissionMatrixQuery",
    "operationKind": "query",
    "text": "query RoleFormModalPermissionMatrixQuery {\n  rbacPermissionMatrix {\n    scopeType\n  }\n}\n"
  }
};
})();

(node as any).hash = "b33c3c63cd1cb02e180b5ffe68024ae1";

export default node;

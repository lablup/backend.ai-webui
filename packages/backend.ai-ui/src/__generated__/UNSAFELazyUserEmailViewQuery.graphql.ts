/**
 * @generated SignedSource<<a4239a803bb40a324d4e2435d01d3bb0>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type UNSAFELazyUserEmailViewQuery$variables = {
  uuid: string;
};
export type UNSAFELazyUserEmailViewQuery$data = {
  readonly user_node: {
    readonly email: string | null | undefined;
  } | null | undefined;
};
export type UNSAFELazyUserEmailViewQuery = {
  response: UNSAFELazyUserEmailViewQuery$data;
  variables: UNSAFELazyUserEmailViewQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "uuid"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "uuid"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "email",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "UNSAFELazyUserEmailViewQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "UserNode",
        "kind": "LinkedField",
        "name": "user_node",
        "plural": false,
        "selections": [
          (v2/*: any*/)
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "UNSAFELazyUserEmailViewQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "UserNode",
        "kind": "LinkedField",
        "name": "user_node",
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
    ]
  },
  "params": {
    "cacheID": "6cb167705df49d003fee4ee02f1ee82e",
    "id": null,
    "metadata": {},
    "name": "UNSAFELazyUserEmailViewQuery",
    "operationKind": "query",
    "text": "query UNSAFELazyUserEmailViewQuery(\n  $uuid: String!\n) {\n  user_node(id: $uuid) {\n    email\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "67caa5daf6f6559a42a344a9b5eadff6";

export default node;

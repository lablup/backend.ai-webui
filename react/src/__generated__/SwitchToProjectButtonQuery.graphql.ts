/**
 * @generated SignedSource<<3848ed0926bc9964b6ebdb3772c96e5c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type SwitchToProjectButtonQuery$variables = {
  projectId: string;
};
export type SwitchToProjectButtonQuery$data = {
  readonly group_node: {
    readonly id: string;
    readonly name: string | null | undefined;
  } | null | undefined;
};
export type SwitchToProjectButtonQuery = {
  response: SwitchToProjectButtonQuery$data;
  variables: SwitchToProjectButtonQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "projectId"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "id",
        "variableName": "projectId"
      }
    ],
    "concreteType": "GroupNode",
    "kind": "LinkedField",
    "name": "group_node",
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
        "name": "name",
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
    "name": "SwitchToProjectButtonQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "SwitchToProjectButtonQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "d9b043a52eacadb018a0097fe3c1f3c2",
    "id": null,
    "metadata": {},
    "name": "SwitchToProjectButtonQuery",
    "operationKind": "query",
    "text": "query SwitchToProjectButtonQuery(\n  $projectId: String!\n) {\n  group_node(id: $projectId) @since(version: \"24.03.0\") {\n    id\n    name\n  }\n}\n"
  }
};
})();

(node as any).hash = "4618e2aed2bc3c75a1d0a91f0b01c28c";

export default node;

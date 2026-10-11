/**
 * @generated SignedSource<<21fa9830ab489a11a347093f654564c8>>
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
    "cacheID": "7a607b48620c9c6baa80d008eedb6147",
    "id": null,
    "metadata": {},
    "name": "SwitchToProjectButtonQuery",
    "operationKind": "query",
    "text": "query SwitchToProjectButtonQuery(\n  $projectId: String!\n) {\n  group_node(id: $projectId) {\n    id\n    name\n  }\n}\n"
  }
};
})();

(node as any).hash = "cca58f1c222430cbc38fa4c733d52d71";

export default node;

/**
 * @generated SignedSource<<a02e50f34899cd212c6aada8976e1df8>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type EditableVFolderNameRefetchQuery$variables = {
  id: string;
};
export type EditableVFolderNameRefetchQuery$data = {
  readonly vfolder_node: {
    readonly id: string;
    readonly name: string | null | undefined;
  } | null | undefined;
};
export type EditableVFolderNameRefetchQuery = {
  response: EditableVFolderNameRefetchQuery$data;
  variables: EditableVFolderNameRefetchQuery$variables;
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
    "concreteType": "VirtualFolderNode",
    "kind": "LinkedField",
    "name": "vfolder_node",
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
    "name": "EditableVFolderNameRefetchQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "EditableVFolderNameRefetchQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "be116a13876da9919082319619a41a4f",
    "id": null,
    "metadata": {},
    "name": "EditableVFolderNameRefetchQuery",
    "operationKind": "query",
    "text": "query EditableVFolderNameRefetchQuery(\n  $id: String!\n) {\n  vfolder_node(id: $id) {\n    id\n    name\n  }\n}\n"
  }
};
})();

(node as any).hash = "c67b7dee09c9b815cce8bbf368de1039";

export default node;

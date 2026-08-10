/**
 * @generated SignedSource<<017bc87d2eaebdb21012626918b83ad4>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BAIDirectoryPickerModalQuery$variables = {
  vfolderGlobalId: string;
};
export type BAIDirectoryPickerModalQuery$data = {
  readonly vfolder_node: {
    readonly name: string | null | undefined;
    readonly permissions: ReadonlyArray<any | null | undefined> | null | undefined;
  } | null | undefined;
};
export type BAIDirectoryPickerModalQuery = {
  response: BAIDirectoryPickerModalQuery$data;
  variables: BAIDirectoryPickerModalQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "vfolderGlobalId"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "vfolderGlobalId"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "permissions",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "BAIDirectoryPickerModalQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "VirtualFolderNode",
        "kind": "LinkedField",
        "name": "vfolder_node",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/)
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
    "name": "BAIDirectoryPickerModalQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "VirtualFolderNode",
        "kind": "LinkedField",
        "name": "vfolder_node",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/),
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
    "cacheID": "6324566f7c4a12b37f72eb612354aa1e",
    "id": null,
    "metadata": {},
    "name": "BAIDirectoryPickerModalQuery",
    "operationKind": "query",
    "text": "query BAIDirectoryPickerModalQuery(\n  $vfolderGlobalId: String!\n) {\n  vfolder_node(id: $vfolderGlobalId) {\n    name\n    permissions\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "a0dd2f262e613fcc30acd13d604f3f30";

export default node;

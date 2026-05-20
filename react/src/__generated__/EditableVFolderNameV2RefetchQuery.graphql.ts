/**
 * @generated SignedSource<<93a9c8818e1d709cbab950a25f000a35>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type EditableVFolderNameV2RefetchQuery$variables = {
  vfolderId: string;
};
export type EditableVFolderNameV2RefetchQuery$data = {
  readonly vfolderV2: {
    readonly id: string;
    readonly metadata: {
      readonly name: string;
    };
  } | null | undefined;
};
export type EditableVFolderNameV2RefetchQuery = {
  response: EditableVFolderNameV2RefetchQuery$data;
  variables: EditableVFolderNameV2RefetchQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "vfolderId"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "vfolderId",
        "variableName": "vfolderId"
      }
    ],
    "concreteType": "VFolder",
    "kind": "LinkedField",
    "name": "vfolderV2",
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
        "concreteType": "VFolderMetadataInfo",
        "kind": "LinkedField",
        "name": "metadata",
        "plural": false,
        "selections": [
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
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "EditableVFolderNameV2RefetchQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "EditableVFolderNameV2RefetchQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "8c6dc27992d0110b8b63b5768b6b67a6",
    "id": null,
    "metadata": {},
    "name": "EditableVFolderNameV2RefetchQuery",
    "operationKind": "query",
    "text": "query EditableVFolderNameV2RefetchQuery(\n  $vfolderId: UUID!\n) {\n  vfolderV2(vfolderId: $vfolderId) {\n    id\n    metadata {\n      name\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "1f530ed7e96f8426658b650d8a90f7f1";

export default node;

/**
 * @generated SignedSource<<7722feccb475111437fe24e3f3b842ec>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ImportFromHuggingFaceModalQuery$variables = {
  id: string;
};
export type ImportFromHuggingFaceModalQuery$data = {
  readonly group: {
    readonly type: string | null | undefined;
  } | null | undefined;
};
export type ImportFromHuggingFaceModalQuery = {
  response: ImportFromHuggingFaceModalQuery$data;
  variables: ImportFromHuggingFaceModalQuery$variables;
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
    "concreteType": "Group",
    "kind": "LinkedField",
    "name": "group",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "type",
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
    "name": "ImportFromHuggingFaceModalQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ImportFromHuggingFaceModalQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "6c6fc6e1df4b1f6fc89454dabbde4706",
    "id": null,
    "metadata": {},
    "name": "ImportFromHuggingFaceModalQuery",
    "operationKind": "query",
    "text": "query ImportFromHuggingFaceModalQuery(\n  $id: UUID!\n) {\n  group(id: $id) {\n    type @since(version: \"24.03.0\")\n  }\n}\n"
  }
};
})();

(node as any).hash = "d65c064ab8bae6c6266259764029b31d";

export default node;

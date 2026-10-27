/**
 * @generated SignedSource<<90eea1df63ea20f3832b421aad7f4a47>>
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
    "cacheID": "9a5bdb3f11b80bcae1b0e769bb6dd0a2",
    "id": null,
    "metadata": {},
    "name": "ImportFromHuggingFaceModalQuery",
    "operationKind": "query",
    "text": "query ImportFromHuggingFaceModalQuery(\n  $id: UUID!\n) {\n  group(id: $id) {\n    type\n  }\n}\n"
  }
};
})();

(node as any).hash = "f74b392a30c2de2c6041362000075914";

export default node;

/**
 * @generated SignedSource<<0b474490d8280015f805b58c46bd7be4>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ModelCardSelectValueQuery$variables = {
  id: string;
};
export type ModelCardSelectValueQuery$data = {
  readonly modelCardV2: {
    readonly id: string;
    readonly metadata: {
      readonly title: string | null | undefined;
    };
    readonly name: string;
    readonly vfolderId: string;
  } | null | undefined;
};
export type ModelCardSelectValueQuery = {
  response: ModelCardSelectValueQuery$data;
  variables: ModelCardSelectValueQuery$variables;
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
    "concreteType": "ModelCardV2",
    "kind": "LinkedField",
    "name": "modelCardV2",
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
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "vfolderId",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "ModelCardV2Metadata",
        "kind": "LinkedField",
        "name": "metadata",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "title",
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
    "name": "ModelCardSelectValueQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ModelCardSelectValueQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "d829aff1e5f5ae1140a77f54fc8d0d2a",
    "id": null,
    "metadata": {},
    "name": "ModelCardSelectValueQuery",
    "operationKind": "query",
    "text": "query ModelCardSelectValueQuery(\n  $id: UUID!\n) {\n  modelCardV2(id: $id) {\n    id\n    name\n    vfolderId\n    metadata {\n      title\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "305d89ef764a4ed26dacebdbc5690ee1";

export default node;

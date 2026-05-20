/**
 * @generated SignedSource<<0535132828abc9eed973a60752c269fe>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type DeploymentAddRevisionModalImageNameQuery$variables = {
  id: string;
};
export type DeploymentAddRevisionModalImageNameQuery$data = {
  readonly imageV2: {
    readonly identity: {
      readonly canonicalName: string;
    };
  } | null | undefined;
};
export type DeploymentAddRevisionModalImageNameQuery = {
  response: DeploymentAddRevisionModalImageNameQuery$data;
  variables: DeploymentAddRevisionModalImageNameQuery$variables;
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
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "concreteType": "ImageV2IdentityInfo",
  "kind": "LinkedField",
  "name": "identity",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "canonicalName",
      "storageKey": null
    }
  ],
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "DeploymentAddRevisionModalImageNameQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "ImageV2",
        "kind": "LinkedField",
        "name": "imageV2",
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
    "name": "DeploymentAddRevisionModalImageNameQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "ImageV2",
        "kind": "LinkedField",
        "name": "imageV2",
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
    "cacheID": "c7f86a18b204736e35e7935bb3913511",
    "id": null,
    "metadata": {},
    "name": "DeploymentAddRevisionModalImageNameQuery",
    "operationKind": "query",
    "text": "query DeploymentAddRevisionModalImageNameQuery(\n  $id: ID!\n) {\n  imageV2(id: $id) {\n    identity {\n      canonicalName\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "e0f63d644538b757a6d30c78d1771156";

export default node;

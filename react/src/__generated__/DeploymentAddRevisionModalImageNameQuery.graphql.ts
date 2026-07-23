/**
 * @generated SignedSource<<a9352110d0ad45b9d6726d071c00635a>>
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
      readonly architecture: string;
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
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "architecture",
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
    "cacheID": "71af54781375e6ee4bceb1c73e74d088",
    "id": null,
    "metadata": {},
    "name": "DeploymentAddRevisionModalImageNameQuery",
    "operationKind": "query",
    "text": "query DeploymentAddRevisionModalImageNameQuery(\n  $id: ID!\n) {\n  imageV2(id: $id) {\n    identity {\n      canonicalName\n      architecture\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "7f7c91d5e401085de1ab4d56ffb2ef9b";

export default node;

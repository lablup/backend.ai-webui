/**
 * @generated SignedSource<<723469f4622dfa6277fe0c962c727d09>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BAIDeploymentSelectValueQuery$variables = {
  id: string;
  skipSelected: boolean;
};
export type BAIDeploymentSelectValueQuery$data = {
  readonly deployment?: {
    readonly id: string;
    readonly metadata: {
      readonly name: string;
    };
  } | null | undefined;
};
export type BAIDeploymentSelectValueQuery = {
  response: BAIDeploymentSelectValueQuery$data;
  variables: BAIDeploymentSelectValueQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "skipSelected"
  }
],
v1 = [
  {
    "condition": "skipSelected",
    "kind": "Condition",
    "passingValue": false,
    "selections": [
      {
        "alias": null,
        "args": [
          {
            "kind": "Variable",
            "name": "id",
            "variableName": "id"
          }
        ],
        "concreteType": "ModelDeployment",
        "kind": "LinkedField",
        "name": "deployment",
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
            "concreteType": "ModelDeploymentMetadata",
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
    ]
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "BAIDeploymentSelectValueQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "BAIDeploymentSelectValueQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "5dd394cbafc9d5883145b77065516724",
    "id": null,
    "metadata": {},
    "name": "BAIDeploymentSelectValueQuery",
    "operationKind": "query",
    "text": "query BAIDeploymentSelectValueQuery(\n  $id: ID!\n  $skipSelected: Boolean!\n) {\n  deployment(id: $id) @skip(if: $skipSelected) {\n    id\n    metadata {\n      name\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "c9766a564bc002ef006d4c6185502d9d";

export default node;

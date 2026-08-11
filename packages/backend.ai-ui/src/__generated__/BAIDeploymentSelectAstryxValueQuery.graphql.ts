/**
 * @generated SignedSource<<b8972321dd079fb3204a5354de1bdda5>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BAIDeploymentSelectAstryxValueQuery$variables = {
  id: string;
  skipSelected: boolean;
};
export type BAIDeploymentSelectAstryxValueQuery$data = {
  readonly deployment?: {
    readonly id: string;
    readonly metadata: {
      readonly name: string;
    };
  } | null | undefined;
};
export type BAIDeploymentSelectAstryxValueQuery = {
  response: BAIDeploymentSelectAstryxValueQuery$data;
  variables: BAIDeploymentSelectAstryxValueQuery$variables;
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
    "name": "BAIDeploymentSelectAstryxValueQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "BAIDeploymentSelectAstryxValueQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "b62e447b384cc66a66ced57c25c48714",
    "id": null,
    "metadata": {},
    "name": "BAIDeploymentSelectAstryxValueQuery",
    "operationKind": "query",
    "text": "query BAIDeploymentSelectAstryxValueQuery(\n  $id: ID!\n  $skipSelected: Boolean!\n) {\n  deployment(id: $id) @skip(if: $skipSelected) {\n    id\n    metadata {\n      name\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "bcde10d46f29a4e3cb3cc10118fe903a";

export default node;

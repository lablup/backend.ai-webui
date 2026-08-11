/**
 * @generated SignedSource<<43f1f8d6b20f1d44e139db211eab19ba>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BAIAdminModelServiceSelectAstryxValueQuery$variables = {
  id: string;
  skipSelected: boolean;
};
export type BAIAdminModelServiceSelectAstryxValueQuery$data = {
  readonly deployment?: {
    readonly id: string;
    readonly metadata: {
      readonly name: string;
    };
  } | null | undefined;
};
export type BAIAdminModelServiceSelectAstryxValueQuery = {
  response: BAIAdminModelServiceSelectAstryxValueQuery$data;
  variables: BAIAdminModelServiceSelectAstryxValueQuery$variables;
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
    "name": "BAIAdminModelServiceSelectAstryxValueQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "BAIAdminModelServiceSelectAstryxValueQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "b6fa338c06706b43ad14b392a4b9b35e",
    "id": null,
    "metadata": {},
    "name": "BAIAdminModelServiceSelectAstryxValueQuery",
    "operationKind": "query",
    "text": "query BAIAdminModelServiceSelectAstryxValueQuery(\n  $id: ID!\n  $skipSelected: Boolean!\n) {\n  deployment(id: $id) @skip(if: $skipSelected) {\n    id\n    metadata {\n      name\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "3cb47a790902d8d8930367e43bebf1d8";

export default node;

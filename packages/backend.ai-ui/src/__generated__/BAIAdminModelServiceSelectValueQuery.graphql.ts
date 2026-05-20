/**
 * @generated SignedSource<<fc5f9d9fa3e85077f9c1ca92ee24f9b3>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BAIAdminModelServiceSelectValueQuery$variables = {
  id: string;
  skipSelected: boolean;
};
export type BAIAdminModelServiceSelectValueQuery$data = {
  readonly deployment?: {
    readonly id: string;
    readonly metadata: {
      readonly name: string;
    };
  } | null | undefined;
};
export type BAIAdminModelServiceSelectValueQuery = {
  response: BAIAdminModelServiceSelectValueQuery$data;
  variables: BAIAdminModelServiceSelectValueQuery$variables;
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
    "name": "BAIAdminModelServiceSelectValueQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "BAIAdminModelServiceSelectValueQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "2a544e0a49cc3adf2642de7bb76d3536",
    "id": null,
    "metadata": {},
    "name": "BAIAdminModelServiceSelectValueQuery",
    "operationKind": "query",
    "text": "query BAIAdminModelServiceSelectValueQuery(\n  $id: ID!\n  $skipSelected: Boolean!\n) {\n  deployment(id: $id) @skip(if: $skipSelected) {\n    id\n    metadata {\n      name\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "decbc1ca18d64f46e60db9faac1ba572";

export default node;

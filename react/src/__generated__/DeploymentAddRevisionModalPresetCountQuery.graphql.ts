/**
 * @generated SignedSource<<8fe16e8e706d2f1fe7e7e80a1e9ab469>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type DeploymentAddRevisionModalPresetCountQuery$variables = Record<PropertyKey, never>;
export type DeploymentAddRevisionModalPresetCountQuery$data = {
  readonly deploymentRevisionPresets: {
    readonly count: number;
  } | null | undefined;
};
export type DeploymentAddRevisionModalPresetCountQuery = {
  response: DeploymentAddRevisionModalPresetCountQuery$data;
  variables: DeploymentAddRevisionModalPresetCountQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Literal",
        "name": "first",
        "value": 1
      },
      {
        "kind": "Literal",
        "name": "orderBy",
        "value": [
          {
            "direction": "ASC",
            "field": "RANK"
          }
        ]
      }
    ],
    "concreteType": "DeploymentRevisionPresetConnection",
    "kind": "LinkedField",
    "name": "deploymentRevisionPresets",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "count",
        "storageKey": null
      }
    ],
    "storageKey": "deploymentRevisionPresets(first:1,orderBy:[{\"direction\":\"ASC\",\"field\":\"RANK\"}])"
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "DeploymentAddRevisionModalPresetCountQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "DeploymentAddRevisionModalPresetCountQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "edaa5efa78debd74168a24185822d633",
    "id": null,
    "metadata": {},
    "name": "DeploymentAddRevisionModalPresetCountQuery",
    "operationKind": "query",
    "text": "query DeploymentAddRevisionModalPresetCountQuery {\n  deploymentRevisionPresets(orderBy: [{field: RANK, direction: \"ASC\"}], first: 1) {\n    count\n  }\n}\n"
  }
};
})();

(node as any).hash = "4461df1967b1117642d3190b36d5cb33";

export default node;

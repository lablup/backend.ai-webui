/**
 * @generated SignedSource<<9ee57f8ba51e51cc65d124fc56bd6cab>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type DeploymentAutoScalingCardPresetsQuery$variables = Record<PropertyKey, never>;
export type DeploymentAutoScalingCardPresetsQuery$data = {
  readonly prometheusQueryPresets: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly name: string;
      };
    }>;
  } | null | undefined;
};
export type DeploymentAutoScalingCardPresetsQuery = {
  response: DeploymentAutoScalingCardPresetsQuery$data;
  variables: DeploymentAutoScalingCardPresetsQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "QueryDefinitionConnection",
    "kind": "LinkedField",
    "name": "prometheusQueryPresets",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "QueryDefinitionEdge",
        "kind": "LinkedField",
        "name": "edges",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "QueryDefinition",
            "kind": "LinkedField",
            "name": "node",
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
              }
            ],
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
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "DeploymentAutoScalingCardPresetsQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "DeploymentAutoScalingCardPresetsQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "cc679b7f385bc973b5b68d9964531688",
    "id": null,
    "metadata": {},
    "name": "DeploymentAutoScalingCardPresetsQuery",
    "operationKind": "query",
    "text": "query DeploymentAutoScalingCardPresetsQuery {\n  prometheusQueryPresets {\n    edges {\n      node {\n        id\n        name\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "6d5f2bbfca84b48a6aa4d1e118d88fdb";

export default node;

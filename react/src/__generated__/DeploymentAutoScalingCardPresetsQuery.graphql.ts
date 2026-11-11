/**
 * @generated SignedSource<<6bd8b96af2774614e1a350f9d1d2a008>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type DeploymentAutoScalingCardPresetsQuery$variables = {
  limit: number;
};
export type DeploymentAutoScalingCardPresetsQuery$data = {
  readonly prometheusQueryPresets: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly entityId: string;
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
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "limit"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "limit",
        "variableName": "limit"
      }
    ],
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
                "name": "entityId",
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "DeploymentAutoScalingCardPresetsQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "DeploymentAutoScalingCardPresetsQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "150c650f377915d314accbbe9aee0f1b",
    "id": null,
    "metadata": {},
    "name": "DeploymentAutoScalingCardPresetsQuery",
    "operationKind": "query",
    "text": "query DeploymentAutoScalingCardPresetsQuery(\n  $limit: Int!\n) {\n  prometheusQueryPresets(limit: $limit) {\n    edges {\n      node {\n        id\n        entityId\n        name\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "28c4f08508fd1af9e4a44377bdd418dc";

export default node;

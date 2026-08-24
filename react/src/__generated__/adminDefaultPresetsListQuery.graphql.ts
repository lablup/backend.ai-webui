/**
 * @generated SignedSource<<ac226375b2701177e9fe72cdda3d75af>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type adminDefaultPresetsListQuery$variables = Record<PropertyKey, never>;
export type adminDefaultPresetsListQuery$data = {
  readonly prometheusQueryPresets: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly metricName: string;
        readonly queryTemplate: string;
      };
    }>;
  } | null | undefined;
};
export type adminDefaultPresetsListQuery = {
  response: adminDefaultPresetsListQuery$data;
  variables: adminDefaultPresetsListQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Literal",
        "name": "limit",
        "value": 100
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
                "name": "metricName",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "queryTemplate",
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "storageKey": "prometheusQueryPresets(limit:100)"
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "adminDefaultPresetsListQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "adminDefaultPresetsListQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "cf180f127a479f5c8bb6bc012e282a3c",
    "id": null,
    "metadata": {},
    "name": "adminDefaultPresetsListQuery",
    "operationKind": "query",
    "text": "query adminDefaultPresetsListQuery {\n  prometheusQueryPresets(limit: 100) {\n    edges {\n      node {\n        id\n        metricName\n        queryTemplate\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "bcfc5fabce0952eddc84d530882b2e27";

export default node;

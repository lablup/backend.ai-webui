/**
 * @generated SignedSource<<36c7a61393a4b3429f64f70292c7c165>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type SchedulerType = "DRF" | "FAIR_SHARE" | "FIFO" | "LIFO" | "%future added value";
export type ResourceGroupSchedulerTypeAlertQuery$variables = {
  resourceGroupName: string;
};
export type ResourceGroupSchedulerTypeAlertQuery$data = {
  readonly resourceGroups: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly name: string;
        readonly scheduler: {
          readonly type: SchedulerType;
        };
      };
    }>;
  } | null | undefined;
};
export type ResourceGroupSchedulerTypeAlertQuery = {
  response: ResourceGroupSchedulerTypeAlertQuery$data;
  variables: ResourceGroupSchedulerTypeAlertQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "resourceGroupName"
  }
],
v1 = [
  {
    "fields": [
      {
        "fields": [
          {
            "kind": "Variable",
            "name": "equals",
            "variableName": "resourceGroupName"
          }
        ],
        "kind": "ObjectValue",
        "name": "name"
      }
    ],
    "kind": "ObjectValue",
    "name": "filter"
  },
  {
    "kind": "Literal",
    "name": "limit",
    "value": 1
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "concreteType": "ResourceGroupSchedulerConfig",
  "kind": "LinkedField",
  "name": "scheduler",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "type",
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
    "name": "ResourceGroupSchedulerTypeAlertQuery",
    "selections": [
      {
        "alias": "resourceGroups",
        "args": (v1/*: any*/),
        "concreteType": "ResourceGroupConnection",
        "kind": "LinkedField",
        "name": "adminResourceGroups",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "ResourceGroupEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "ResourceGroup",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v2/*: any*/),
                  (v3/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
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
    "name": "ResourceGroupSchedulerTypeAlertQuery",
    "selections": [
      {
        "alias": "resourceGroups",
        "args": (v1/*: any*/),
        "concreteType": "ResourceGroupConnection",
        "kind": "LinkedField",
        "name": "adminResourceGroups",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "ResourceGroupEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "ResourceGroup",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v2/*: any*/),
                  (v3/*: any*/),
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
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "53ff84ca13ce398b4165c683c1de709a",
    "id": null,
    "metadata": {},
    "name": "ResourceGroupSchedulerTypeAlertQuery",
    "operationKind": "query",
    "text": "query ResourceGroupSchedulerTypeAlertQuery(\n  $resourceGroupName: String!\n) {\n  resourceGroups: adminResourceGroups(filter: {name: {equals: $resourceGroupName}}, limit: 1) {\n    edges {\n      node {\n        name\n        scheduler {\n          type\n        }\n        id\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "3d54462a11c5c849d44e995959a88d0a";

export default node;

/**
 * @generated SignedSource<<d463cbf2b9e32dba356e36b1c7f9031e>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type AdminDeploymentPresetSettingPageResourceSlotTypesQuery$variables = Record<PropertyKey, never>;
export type AdminDeploymentPresetSettingPageResourceSlotTypesQuery$data = {
  readonly resourceSlotTypes: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly displayName: string;
        readonly displayUnit: string;
        readonly id: string;
        readonly numberFormat: {
          readonly binary: boolean;
          readonly roundLength: number;
        };
        readonly slotName: string;
        readonly slotType: string;
      };
    }>;
  } | null | undefined;
};
export type AdminDeploymentPresetSettingPageResourceSlotTypesQuery = {
  response: AdminDeploymentPresetSettingPageResourceSlotTypesQuery$data;
  variables: AdminDeploymentPresetSettingPageResourceSlotTypesQuery$variables;
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
    "concreteType": "ResourceSlotTypeConnection",
    "kind": "LinkedField",
    "name": "resourceSlotTypes",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "ResourceSlotTypeEdge",
        "kind": "LinkedField",
        "name": "edges",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "ResourceSlotType",
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
                "name": "slotName",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "slotType",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "displayName",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "displayUnit",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "NumberFormat",
                "kind": "LinkedField",
                "name": "numberFormat",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "binary",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "roundLength",
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
    ],
    "storageKey": "resourceSlotTypes(limit:100,orderBy:[{\"direction\":\"ASC\",\"field\":\"RANK\"}])"
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "AdminDeploymentPresetSettingPageResourceSlotTypesQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "AdminDeploymentPresetSettingPageResourceSlotTypesQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "68f80d05b5bb6ddc639f1aada8bc212d",
    "id": null,
    "metadata": {},
    "name": "AdminDeploymentPresetSettingPageResourceSlotTypesQuery",
    "operationKind": "query",
    "text": "query AdminDeploymentPresetSettingPageResourceSlotTypesQuery {\n  resourceSlotTypes(limit: 100, orderBy: [{field: RANK, direction: ASC}]) {\n    edges {\n      node {\n        id\n        slotName\n        slotType\n        displayName\n        displayUnit\n        numberFormat {\n          binary\n          roundLength\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "a33ee9b5175e22a3cc8c62b176539a39";

export default node;

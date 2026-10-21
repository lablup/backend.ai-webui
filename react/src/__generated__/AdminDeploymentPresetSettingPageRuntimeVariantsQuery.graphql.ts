/**
 * @generated SignedSource<<eead0a5fd31a7f6cfb482bcc4c5cba12>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type AdminDeploymentPresetSettingPageRuntimeVariantsQuery$variables = Record<PropertyKey, never>;
export type AdminDeploymentPresetSettingPageRuntimeVariantsQuery$data = {
  readonly runtimeVariants: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly entityId: string;
        readonly name: string;
        readonly readsVfolderConfigFiles: boolean;
      };
    }>;
  } | null | undefined;
};
export type AdminDeploymentPresetSettingPageRuntimeVariantsQuery = {
  response: AdminDeploymentPresetSettingPageRuntimeVariantsQuery$data;
  variables: AdminDeploymentPresetSettingPageRuntimeVariantsQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "limit",
    "value": 100
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "entityId",
  "storageKey": null
},
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
  "kind": "ScalarField",
  "name": "readsVfolderConfigFiles",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "AdminDeploymentPresetSettingPageRuntimeVariantsQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": "RuntimeVariantConnection",
        "kind": "LinkedField",
        "name": "runtimeVariants",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "RuntimeVariantEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "RuntimeVariant",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v1/*: any*/),
                  (v2/*: any*/),
                  (v3/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": "runtimeVariants(limit:100)"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "AdminDeploymentPresetSettingPageRuntimeVariantsQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": "RuntimeVariantConnection",
        "kind": "LinkedField",
        "name": "runtimeVariants",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "RuntimeVariantEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "RuntimeVariant",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v1/*: any*/),
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
        "storageKey": "runtimeVariants(limit:100)"
      }
    ]
  },
  "params": {
    "cacheID": "61347dc69c5f146657fc7032fe5f3511",
    "id": null,
    "metadata": {},
    "name": "AdminDeploymentPresetSettingPageRuntimeVariantsQuery",
    "operationKind": "query",
    "text": "query AdminDeploymentPresetSettingPageRuntimeVariantsQuery {\n  runtimeVariants(limit: 100) {\n    edges {\n      node {\n        entityId\n        name\n        readsVfolderConfigFiles @since(version: \"26.8.0\")\n        id\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "fd71ca15f7375681e4fc2f113dce6d90";

export default node;

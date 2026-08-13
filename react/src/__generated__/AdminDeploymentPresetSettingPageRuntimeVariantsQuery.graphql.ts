/**
 * @generated SignedSource<<4cb02aa3f1a4bf84048b8bc83f59a680>>
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
        readonly id: string;
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
    "alias": null,
    "args": [
      {
        "kind": "Literal",
        "name": "limit",
        "value": 100
      }
    ],
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
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "readsVfolderConfigFiles",
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
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "AdminDeploymentPresetSettingPageRuntimeVariantsQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "AdminDeploymentPresetSettingPageRuntimeVariantsQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "90d316137f9a6db8bab220567b910f76",
    "id": null,
    "metadata": {},
    "name": "AdminDeploymentPresetSettingPageRuntimeVariantsQuery",
    "operationKind": "query",
    "text": "query AdminDeploymentPresetSettingPageRuntimeVariantsQuery {\n  runtimeVariants(limit: 100) {\n    edges {\n      node {\n        id\n        name\n        readsVfolderConfigFiles @since(version: \"26.8.0\")\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "b6c7581f0a2465ead5b7a6db6a372ca3";

export default node;

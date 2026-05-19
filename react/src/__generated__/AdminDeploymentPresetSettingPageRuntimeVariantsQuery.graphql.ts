/**
 * @generated SignedSource<<c1d09e666153f4e98c655abc9048877d>>
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
    "cacheID": "303456b9197e50b38faf484f9b6531f8",
    "id": null,
    "metadata": {},
    "name": "AdminDeploymentPresetSettingPageRuntimeVariantsQuery",
    "operationKind": "query",
    "text": "query AdminDeploymentPresetSettingPageRuntimeVariantsQuery {\n  runtimeVariants(limit: 100) {\n    edges {\n      node {\n        id\n        name\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "ea81894e4891b01705b4f65a6e8577ee";

export default node;

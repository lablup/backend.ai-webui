/**
 * @generated SignedSource<<09c354441a4d5eeafb0e24d0d57073cd>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type AdminDeploymentPresetNodesImagesQuery$variables = {
  ids: ReadonlyArray<string>;
  limit: number;
};
export type AdminDeploymentPresetNodesImagesQuery$data = {
  readonly adminImagesV2: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly identity: {
          readonly architecture: string;
          readonly canonicalName: string;
        };
      };
    }>;
  } | null | undefined;
};
export type AdminDeploymentPresetNodesImagesQuery = {
  response: AdminDeploymentPresetNodesImagesQuery$data;
  variables: AdminDeploymentPresetNodesImagesQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "ids"
  },
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
        "fields": [
          {
            "fields": [
              {
                "kind": "Variable",
                "name": "in",
                "variableName": "ids"
              }
            ],
            "kind": "ObjectValue",
            "name": "id"
          }
        ],
        "kind": "ObjectValue",
        "name": "filter"
      },
      {
        "kind": "Variable",
        "name": "limit",
        "variableName": "limit"
      }
    ],
    "concreteType": "ImageV2Connection",
    "kind": "LinkedField",
    "name": "adminImagesV2",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "ImageV2Edge",
        "kind": "LinkedField",
        "name": "edges",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "ImageV2",
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
                "concreteType": "ImageV2IdentityInfo",
                "kind": "LinkedField",
                "name": "identity",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "canonicalName",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "architecture",
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
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "AdminDeploymentPresetNodesImagesQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "AdminDeploymentPresetNodesImagesQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "604ff4cb5204d2b04162356cf1bc921e",
    "id": null,
    "metadata": {},
    "name": "AdminDeploymentPresetNodesImagesQuery",
    "operationKind": "query",
    "text": "query AdminDeploymentPresetNodesImagesQuery(\n  $ids: [UUID!]!\n  $limit: Int!\n) {\n  adminImagesV2(filter: {id: {in: $ids}}, limit: $limit) {\n    edges {\n      node {\n        id\n        identity {\n          canonicalName\n          architecture\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "3d1d4122d3da2b08617c72d2defb1ad0";

export default node;

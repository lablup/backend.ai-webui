/**
 * @generated SignedSource<<65edfb88908aad5cb9265eeec22282e6>>
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
    "cacheID": "b16c3e55edc57c5e3de2cfb8b5a26a34",
    "id": null,
    "metadata": {},
    "name": "AdminDeploymentPresetNodesImagesQuery",
    "operationKind": "query",
    "text": "query AdminDeploymentPresetNodesImagesQuery(\n  $ids: [UUID!]!\n  $limit: Int!\n) {\n  adminImagesV2(filter: {id: {in: $ids}}, limit: $limit) {\n    edges {\n      node {\n        id\n        identity {\n          canonicalName\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "d8f2ec0224716ede95d74f0cc01629c0";

export default node;

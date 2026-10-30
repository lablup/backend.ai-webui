/**
 * @generated SignedSource<<9c93072304bb4679f3e8095dd3ee7a77>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ImageSearchScope = {
  containerRegistry?: ReadonlyArray<UUIDScope> | null | undefined;
  domain?: ReadonlyArray<UUIDScope> | null | undefined;
  project?: ReadonlyArray<UUIDScope> | null | undefined;
  public?: boolean;
  user?: ReadonlyArray<UUIDScope> | null | undefined;
};
export type UUIDScope = {
  value: string;
};
export type BAIScopedImageSelectValueQuery$variables = {
  ids?: ReadonlyArray<string> | null | undefined;
  scope: ImageSearchScope;
  skipSelected: boolean;
};
export type BAIScopedImageSelectValueQuery$data = {
  readonly scopedImagesV2?: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly entityId: string;
        readonly id: string;
        readonly identity: {
          readonly architecture: string;
          readonly canonicalName: string;
        };
      };
    }>;
  } | null | undefined;
};
export type BAIScopedImageSelectValueQuery = {
  response: BAIScopedImageSelectValueQuery$data;
  variables: BAIScopedImageSelectValueQuery$variables;
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
    "name": "scope"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "skipSelected"
  }
],
v1 = [
  {
    "condition": "skipSelected",
    "kind": "Condition",
    "passingValue": false,
    "selections": [
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
            "kind": "Literal",
            "name": "limit",
            "value": 100
          },
          {
            "kind": "Variable",
            "name": "scope",
            "variableName": "scope"
          }
        ],
        "concreteType": "ImageV2Connection",
        "kind": "LinkedField",
        "name": "scopedImagesV2",
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
                    "kind": "ScalarField",
                    "name": "entityId",
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
    ]
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "BAIScopedImageSelectValueQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "BAIScopedImageSelectValueQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "e5d920d894b54dab01c081ce017530ae",
    "id": null,
    "metadata": {},
    "name": "BAIScopedImageSelectValueQuery",
    "operationKind": "query",
    "text": "query BAIScopedImageSelectValueQuery(\n  $ids: [UUID!]\n  $scope: ImageSearchScope!\n  $skipSelected: Boolean!\n) {\n  scopedImagesV2(scope: $scope, filter: {id: {in: $ids}}, limit: 100) @skip(if: $skipSelected) {\n    edges {\n      node {\n        id\n        entityId\n        identity {\n          canonicalName\n          architecture\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "b561b4e248e4232d7cbe02fa1199f2f5";

export default node;

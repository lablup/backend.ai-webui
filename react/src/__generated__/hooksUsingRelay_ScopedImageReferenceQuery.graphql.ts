/**
 * @generated SignedSource<<148a191e795d4a0f5bc01dd565ef2e2e>>
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
export type hooksUsingRelay_ScopedImageReferenceQuery$variables = {
  id: string;
  scope: ImageSearchScope;
};
export type hooksUsingRelay_ScopedImageReferenceQuery$data = {
  readonly scopedImagesV2: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly identity: {
          readonly architecture: string;
          readonly canonicalName: string;
        };
      };
    }>;
  } | null | undefined;
};
export type hooksUsingRelay_ScopedImageReferenceQuery = {
  response: hooksUsingRelay_ScopedImageReferenceQuery$data;
  variables: hooksUsingRelay_ScopedImageReferenceQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "scope"
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
            "variableName": "id"
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
    "value": 1
  },
  {
    "kind": "Variable",
    "name": "scope",
    "variableName": "scope"
  }
],
v2 = {
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
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "hooksUsingRelay_ScopedImageReferenceQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
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
                  (v2/*: any*/)
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
    "name": "hooksUsingRelay_ScopedImageReferenceQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
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
                  (v2/*: any*/),
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
    "cacheID": "fab5172f99ca7cbdd0a8ce894b1dff41",
    "id": null,
    "metadata": {},
    "name": "hooksUsingRelay_ScopedImageReferenceQuery",
    "operationKind": "query",
    "text": "query hooksUsingRelay_ScopedImageReferenceQuery(\n  $id: UUID!\n  $scope: ImageSearchScope!\n) {\n  scopedImagesV2(scope: $scope, filter: {id: {equals: $id}}, limit: 1) {\n    edges {\n      node {\n        identity {\n          canonicalName\n          architecture\n        }\n        id\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "64331ab01b07af6759f80b8c8fd0f0a4";

export default node;

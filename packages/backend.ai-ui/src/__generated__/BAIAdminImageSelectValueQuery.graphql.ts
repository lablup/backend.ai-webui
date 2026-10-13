/**
 * @generated SignedSource<<fdbf26e9dead1bf5ced36bc12c5b6c9e>>
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
export type BAIAdminImageSelectValueQuery$variables = {
  ids?: ReadonlyArray<string> | null | undefined;
  scope: ImageSearchScope;
  skipAdmin: boolean;
  skipScoped: boolean;
};
export type BAIAdminImageSelectValueQuery$data = {
  readonly adminImagesV2?: {
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
  readonly scopedImagesV2?: {
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
export type BAIAdminImageSelectValueQuery = {
  response: BAIAdminImageSelectValueQuery$data;
  variables: BAIAdminImageSelectValueQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "ids"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "scope"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "skipAdmin"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "skipScoped"
},
v4 = {
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
v5 = {
  "kind": "Literal",
  "name": "limit",
  "value": 100
},
v6 = [
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
v7 = [
  {
    "condition": "skipScoped",
    "kind": "Condition",
    "passingValue": false,
    "selections": [
      {
        "alias": null,
        "args": [
          (v4/*: any*/),
          (v5/*: any*/),
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
        "selections": (v6/*: any*/),
        "storageKey": null
      }
    ]
  },
  {
    "condition": "skipAdmin",
    "kind": "Condition",
    "passingValue": false,
    "selections": [
      {
        "alias": null,
        "args": [
          (v4/*: any*/),
          (v5/*: any*/)
        ],
        "concreteType": "ImageV2Connection",
        "kind": "LinkedField",
        "name": "adminImagesV2",
        "plural": false,
        "selections": (v6/*: any*/),
        "storageKey": null
      }
    ]
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "BAIAdminImageSelectValueQuery",
    "selections": (v7/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v3/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Operation",
    "name": "BAIAdminImageSelectValueQuery",
    "selections": (v7/*: any*/)
  },
  "params": {
    "cacheID": "3e671ddec7bec812874ad1b05d68839d",
    "id": null,
    "metadata": {},
    "name": "BAIAdminImageSelectValueQuery",
    "operationKind": "query",
    "text": "query BAIAdminImageSelectValueQuery(\n  $ids: [UUID!]\n  $scope: ImageSearchScope!\n  $skipScoped: Boolean!\n  $skipAdmin: Boolean!\n) {\n  scopedImagesV2(scope: $scope, filter: {id: {in: $ids}}, limit: 100) @skip(if: $skipScoped) @since(version: \"26.9.0a4\") {\n    edges {\n      node {\n        id\n        identity {\n          canonicalName\n          architecture\n        }\n      }\n    }\n  }\n  adminImagesV2(filter: {id: {in: $ids}}, limit: 100) @skip(if: $skipAdmin) {\n    edges {\n      node {\n        id\n        identity {\n          canonicalName\n          architecture\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "0b990ad3b9ff1d11528b967bd585a48a";

export default node;

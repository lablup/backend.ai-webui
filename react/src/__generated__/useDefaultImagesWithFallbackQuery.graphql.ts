/**
 * @generated SignedSource<<15af007cd87fbd4d0b901ba12c0e395e>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type useDefaultImagesWithFallbackQuery$variables = {
  installed?: boolean | null | undefined;
};
export type useDefaultImagesWithFallbackQuery$data = {
  readonly images: ReadonlyArray<{
    readonly architecture: string | null | undefined;
    readonly id: string | null | undefined;
    readonly labels: ReadonlyArray<{
      readonly key: string | null | undefined;
      readonly value: string | null | undefined;
    } | null | undefined> | null | undefined;
    readonly name: string | null | undefined;
    readonly namespace: string | null | undefined;
    readonly registry: string | null | undefined;
    readonly resource_limits: ReadonlyArray<{
      readonly key: string | null | undefined;
      readonly max: string | null | undefined;
      readonly min: string | null | undefined;
    } | null | undefined> | null | undefined;
    readonly tag: string | null | undefined;
    readonly tags: ReadonlyArray<{
      readonly key: string | null | undefined;
      readonly value: string | null | undefined;
    } | null | undefined> | null | undefined;
  } | null | undefined> | null | undefined;
};
export type useDefaultImagesWithFallbackQuery = {
  response: useDefaultImagesWithFallbackQuery$data;
  variables: useDefaultImagesWithFallbackQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "installed"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "key",
  "storageKey": null
},
v2 = [
  (v1/*: any*/),
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "value",
    "storageKey": null
  }
],
v3 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "is_installed",
        "variableName": "installed"
      }
    ],
    "concreteType": "Image",
    "kind": "LinkedField",
    "name": "images",
    "plural": true,
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
        "name": "tag",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "registry",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "architecture",
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
        "name": "namespace",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "KVPair",
        "kind": "LinkedField",
        "name": "labels",
        "plural": true,
        "selections": (v2/*: any*/),
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "KVPair",
        "kind": "LinkedField",
        "name": "tags",
        "plural": true,
        "selections": (v2/*: any*/),
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "ResourceLimit",
        "kind": "LinkedField",
        "name": "resource_limits",
        "plural": true,
        "selections": [
          (v1/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "min",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "max",
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
    "name": "useDefaultImagesWithFallbackQuery",
    "selections": (v3/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "useDefaultImagesWithFallbackQuery",
    "selections": (v3/*: any*/)
  },
  "params": {
    "cacheID": "50986f0b2ceaf84de4cd397a2d793329",
    "id": null,
    "metadata": {},
    "name": "useDefaultImagesWithFallbackQuery",
    "operationKind": "query",
    "text": "query useDefaultImagesWithFallbackQuery(\n  $installed: Boolean\n) {\n  images(is_installed: $installed) {\n    id\n    tag\n    registry\n    architecture\n    name @deprecatedSince(version: \"24.12.0\")\n    namespace @since(version: \"24.12.0\")\n    labels {\n      key\n      value\n    }\n    tags @since(version: \"24.12.0\") {\n      key\n      value\n    }\n    resource_limits {\n      key\n      min\n      max\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "10405daea8947c9eb138ed58ff364fe0";

export default node;

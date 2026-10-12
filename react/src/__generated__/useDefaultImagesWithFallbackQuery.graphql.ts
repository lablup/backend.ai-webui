/**
 * @generated SignedSource<<edc89320fbd851013509e7b8fd8d1d21>>
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
    "cacheID": "9ab17e1599bcc5bc00de2b9e9bba588d",
    "id": null,
    "metadata": {},
    "name": "useDefaultImagesWithFallbackQuery",
    "operationKind": "query",
    "text": "query useDefaultImagesWithFallbackQuery(\n  $installed: Boolean\n) {\n  images(is_installed: $installed) {\n    id\n    tag\n    registry\n    architecture\n    namespace\n    labels {\n      key\n      value\n    }\n    tags {\n      key\n      value\n    }\n    resource_limits {\n      key\n      min\n      max\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "eb58e7ce4ab6b04c3bc41e67418d1142";

export default node;

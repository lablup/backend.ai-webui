/**
 * @generated SignedSource<<cb9e2aaa329fbc7b9587782a6a5523d1>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ResourceGroupDefaultSessionOptionsPanelImageQuery$variables = {
  imageId: string;
};
export type ResourceGroupDefaultSessionOptionsPanelImageQuery$data = {
  readonly adminImagesV2: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly " $fragmentSpreads": FragmentRefs<"BAIImageNodeSimpleTagV2Fragment">;
      };
    }>;
  } | null | undefined;
};
export type ResourceGroupDefaultSessionOptionsPanelImageQuery = {
  response: ResourceGroupDefaultSessionOptionsPanelImageQuery$data;
  variables: ResourceGroupDefaultSessionOptionsPanelImageQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "imageId"
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
            "variableName": "imageId"
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
  }
],
v2 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "key",
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "value",
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "ResourceGroupDefaultSessionOptionsPanelImageQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
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
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "BAIImageNodeSimpleTagV2Fragment"
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
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ResourceGroupDefaultSessionOptionsPanelImageQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
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
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "ImageV2MetadataInfo",
                    "kind": "LinkedField",
                    "name": "metadata",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "ImageV2TagEntry",
                        "kind": "LinkedField",
                        "name": "tags",
                        "plural": true,
                        "selections": (v2/*: any*/),
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "ImageV2LabelEntry",
                        "kind": "LinkedField",
                        "name": "labels",
                        "plural": true,
                        "selections": (v2/*: any*/),
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  },
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
    "cacheID": "fc56c7b5feaee0ba758587f036d40e1a",
    "id": null,
    "metadata": {},
    "name": "ResourceGroupDefaultSessionOptionsPanelImageQuery",
    "operationKind": "query",
    "text": "query ResourceGroupDefaultSessionOptionsPanelImageQuery(\n  $imageId: UUID!\n) {\n  adminImagesV2(filter: {id: {equals: $imageId}}, limit: 1) {\n    edges {\n      node {\n        ...BAIImageNodeSimpleTagV2Fragment\n        id\n      }\n    }\n  }\n}\n\nfragment BAIImageNodeSimpleTagV2Fragment on ImageV2 {\n  identity {\n    canonicalName\n    architecture\n  }\n  metadata {\n    tags {\n      key\n      value\n    }\n    labels {\n      key\n      value\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "4030e516cf7633f24f4adf34adcf3bbc";

export default node;

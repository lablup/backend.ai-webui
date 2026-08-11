/**
 * @generated SignedSource<<36eecfab44cb280dc8ff8a33dba23638>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BAIAdminImageSelectAstryxValueQuery$variables = {
  ids?: ReadonlyArray<string> | null | undefined;
  skipSelected: boolean;
};
export type BAIAdminImageSelectAstryxValueQuery$data = {
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
};
export type BAIAdminImageSelectAstryxValueQuery = {
  response: BAIAdminImageSelectAstryxValueQuery$data;
  variables: BAIAdminImageSelectAstryxValueQuery$variables;
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
    ]
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "BAIAdminImageSelectAstryxValueQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "BAIAdminImageSelectAstryxValueQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "1c14d91a1a1fa7ea3360cf2a8def10cf",
    "id": null,
    "metadata": {},
    "name": "BAIAdminImageSelectAstryxValueQuery",
    "operationKind": "query",
    "text": "query BAIAdminImageSelectAstryxValueQuery(\n  $ids: [UUID!]\n  $skipSelected: Boolean!\n) {\n  adminImagesV2(filter: {id: {in: $ids}}, limit: 100) @skip(if: $skipSelected) {\n    edges {\n      node {\n        id\n        identity {\n          canonicalName\n          architecture\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "61ac71af3f17f63ee73cf33f8b5f461d";

export default node;

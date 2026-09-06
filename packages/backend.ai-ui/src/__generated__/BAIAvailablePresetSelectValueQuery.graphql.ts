/**
 * @generated SignedSource<<650157eb61d9f30c2154b7b723dd1c2c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BAIAvailablePresetSelectValueQuery$variables = {
  first: number;
  ids?: ReadonlyArray<string> | null | undefined;
  skip: boolean;
};
export type BAIAvailablePresetSelectValueQuery$data = {
  readonly deploymentRevisionPresets?: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly description: string | null | undefined;
        readonly id: string;
        readonly name: string;
      };
    }>;
  } | null | undefined;
};
export type BAIAvailablePresetSelectValueQuery = {
  response: BAIAvailablePresetSelectValueQuery$data;
  variables: BAIAvailablePresetSelectValueQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "first"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "ids"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "skip"
},
v3 = [
  {
    "condition": "skip",
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
            "kind": "Variable",
            "name": "first",
            "variableName": "first"
          }
        ],
        "concreteType": "DeploymentRevisionPresetConnection",
        "kind": "LinkedField",
        "name": "deploymentRevisionPresets",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "DeploymentRevisionPresetEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "DeploymentRevisionPreset",
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
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "description",
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
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "BAIAvailablePresetSelectValueQuery",
    "selections": (v3/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Operation",
    "name": "BAIAvailablePresetSelectValueQuery",
    "selections": (v3/*: any*/)
  },
  "params": {
    "cacheID": "764a9eece49de50435dc438c94ee6e4c",
    "id": null,
    "metadata": {},
    "name": "BAIAvailablePresetSelectValueQuery",
    "operationKind": "query",
    "text": "query BAIAvailablePresetSelectValueQuery(\n  $ids: [UUID!]\n  $first: Int!\n  $skip: Boolean!\n) {\n  deploymentRevisionPresets(filter: {id: {in: $ids}}, first: $first) @skip(if: $skip) {\n    edges {\n      node {\n        id\n        name\n        description\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "dcdae7e7805dee41d0a10741a101b9e1";

export default node;

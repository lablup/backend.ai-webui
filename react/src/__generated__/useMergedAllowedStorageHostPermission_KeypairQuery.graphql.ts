/**
 * @generated SignedSource<<19d58477585ef5b61488021075bb9c2c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type useMergedAllowedStorageHostPermission_KeypairQuery$variables = {
  accessKey: string;
};
export type useMergedAllowedStorageHostPermission_KeypairQuery$data = {
  readonly myKeypairs: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly resourcePolicy: string;
      };
    }>;
  };
};
export type useMergedAllowedStorageHostPermission_KeypairQuery = {
  response: useMergedAllowedStorageHostPermission_KeypairQuery$data;
  variables: useMergedAllowedStorageHostPermission_KeypairQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "accessKey"
  }
],
v1 = {
  "alias": null,
  "args": [
    {
      "fields": [
        {
          "fields": [
            {
              "kind": "Variable",
              "name": "equals",
              "variableName": "accessKey"
            }
          ],
          "kind": "ObjectValue",
          "name": "accessKey"
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
  "concreteType": "KeyPairConnection",
  "kind": "LinkedField",
  "name": "myKeypairs",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "KeyPairV2Edge",
      "kind": "LinkedField",
      "name": "edges",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "KeyPairV2",
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
              "name": "resourcePolicy",
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
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "useMergedAllowedStorageHostPermission_KeypairQuery",
    "selections": [
      {
        "kind": "RequiredField",
        "field": (v1/*: any*/),
        "action": "THROW"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "useMergedAllowedStorageHostPermission_KeypairQuery",
    "selections": [
      (v1/*: any*/)
    ]
  },
  "params": {
    "cacheID": "479eed23a50856c0b03fcb0cd95ad20f",
    "id": null,
    "metadata": {},
    "name": "useMergedAllowedStorageHostPermission_KeypairQuery",
    "operationKind": "query",
    "text": "query useMergedAllowedStorageHostPermission_KeypairQuery(\n  $accessKey: String!\n) {\n  myKeypairs(filter: {accessKey: {equals: $accessKey}}, limit: 1) {\n    edges {\n      node {\n        id\n        resourcePolicy\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "d1110585d475bb5b2a2779e581e9751b";

export default node;

/**
 * @generated SignedSource<<46aa922d4cfd9f9fcb5d0e29582b5b45>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type hooksUsingRelay_ImageCanonicalNameQuery$variables = {
  id: string;
};
export type hooksUsingRelay_ImageCanonicalNameQuery$data = {
  readonly imageV2: {
    readonly identity: {
      readonly canonicalName: string;
    };
  } | null | undefined;
};
export type hooksUsingRelay_ImageCanonicalNameQuery = {
  response: hooksUsingRelay_ImageCanonicalNameQuery$data;
  variables: hooksUsingRelay_ImageCanonicalNameQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
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
    }
  ],
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "hooksUsingRelay_ImageCanonicalNameQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "ImageV2",
        "kind": "LinkedField",
        "name": "imageV2",
        "plural": false,
        "selections": [
          (v2/*: any*/)
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
    "name": "hooksUsingRelay_ImageCanonicalNameQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "ImageV2",
        "kind": "LinkedField",
        "name": "imageV2",
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
    ]
  },
  "params": {
    "cacheID": "558d007b29459001f7e11ab7c77f04bf",
    "id": null,
    "metadata": {},
    "name": "hooksUsingRelay_ImageCanonicalNameQuery",
    "operationKind": "query",
    "text": "query hooksUsingRelay_ImageCanonicalNameQuery(\n  $id: ID!\n) {\n  imageV2(id: $id) {\n    identity {\n      canonicalName\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "2b692ed8ddc7d228e00b9577e8585a15";

export default node;

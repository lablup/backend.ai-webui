/**
 * @generated SignedSource<<a16917b4d9ac42034bd1860f90d369cd>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ScanImageInput = {
  architecture: string;
  canonical: string;
};
export type ImportImageModalScanImageMutation$variables = {
  input: ScanImageInput;
};
export type ImportImageModalScanImageMutation$data = {
  readonly adminScanImage: {
    readonly item: {
      readonly id: string;
      readonly identity: {
        readonly architecture: string;
        readonly canonicalName: string;
      };
    };
  } | null | undefined;
};
export type ImportImageModalScanImageMutation = {
  response: ImportImageModalScanImageMutation$data;
  variables: ImportImageModalScanImageMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "ScanImagePayload",
    "kind": "LinkedField",
    "name": "adminScanImage",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "ImageV2",
        "kind": "LinkedField",
        "name": "item",
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
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "ImportImageModalScanImageMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ImportImageModalScanImageMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "35406510c4b43cdbe1cb3b1c14ad7618",
    "id": null,
    "metadata": {},
    "name": "ImportImageModalScanImageMutation",
    "operationKind": "mutation",
    "text": "mutation ImportImageModalScanImageMutation(\n  $input: ScanImageInput!\n) {\n  adminScanImage(input: $input) {\n    item {\n      id\n      identity {\n        canonicalName\n        architecture\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "08ad7b8c6167eb47d2f9360cfa956567";

export default node;

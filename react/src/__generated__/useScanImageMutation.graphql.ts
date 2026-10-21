/**
 * @generated SignedSource<<9fb18b7a85b9c8458a8c05372a770b52>>
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
export type useScanImageMutation$variables = {
  input: ScanImageInput;
};
export type useScanImageMutation$data = {
  readonly adminScanImage: {
    readonly item: {
      readonly id: string;
    };
  } | null | undefined;
};
export type useScanImageMutation = {
  response: useScanImageMutation$data;
  variables: useScanImageMutation$variables;
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
    "name": "useScanImageMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "useScanImageMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "0d0e81f81de19ca7d0ff1849a0bc550d",
    "id": null,
    "metadata": {},
    "name": "useScanImageMutation",
    "operationKind": "mutation",
    "text": "mutation useScanImageMutation(\n  $input: ScanImageInput!\n) {\n  adminScanImage(input: $input) {\n    item {\n      id\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "f9986fc355e55ea6dde70c55830c3160";

export default node;

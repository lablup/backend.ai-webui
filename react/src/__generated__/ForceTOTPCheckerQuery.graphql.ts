/**
 * @generated SignedSource<<34fe6fd50d15a60b11fc3b90537753b1>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ForceTOTPCheckerQuery$variables = {
  isNotSupportTotp: boolean;
};
export type ForceTOTPCheckerQuery$data = {
  readonly myUserV2: {
    readonly security: {
      readonly totpActivated: boolean | null | undefined;
    };
    readonly " $fragmentSpreads": FragmentRefs<"TOTPActivateModalFragment">;
  } | null | undefined;
};
export type ForceTOTPCheckerQuery = {
  response: ForceTOTPCheckerQuery$data;
  variables: ForceTOTPCheckerQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "isNotSupportTotp"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "concreteType": "UserV2SecurityInfo",
  "kind": "LinkedField",
  "name": "security",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "totpActivated",
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
    "name": "ForceTOTPCheckerQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "UserV2",
        "kind": "LinkedField",
        "name": "myUserV2",
        "plural": false,
        "selections": [
          (v1/*: any*/),
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "TOTPActivateModalFragment"
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
    "name": "ForceTOTPCheckerQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "UserV2",
        "kind": "LinkedField",
        "name": "myUserV2",
        "plural": false,
        "selections": [
          (v1/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "UserV2BasicInfo",
            "kind": "LinkedField",
            "name": "basicInfo",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "email",
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
    ]
  },
  "params": {
    "cacheID": "8fb38b90c90755984db4944f61e7d954",
    "id": null,
    "metadata": {},
    "name": "ForceTOTPCheckerQuery",
    "operationKind": "query",
    "text": "query ForceTOTPCheckerQuery(\n  $isNotSupportTotp: Boolean!\n) {\n  myUserV2 {\n    security {\n      totpActivated @skipOnClient(if: $isNotSupportTotp)\n    }\n    ...TOTPActivateModalFragment\n    id\n  }\n}\n\nfragment TOTPActivateModalFragment on UserV2 {\n  basicInfo {\n    email\n  }\n  security {\n    totpActivated @skipOnClient(if: $isNotSupportTotp)\n  }\n}\n"
  }
};
})();

(node as any).hash = "b4059de5b963751573cacd523dc23c66";

export default node;

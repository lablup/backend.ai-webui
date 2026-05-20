/**
 * @generated SignedSource<<ca686cde6615b723817c7c12df3acf14>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ForceTOTPCheckerQuery$variables = {
  email?: string | null | undefined;
  isNotSupportTotp: boolean;
};
export type ForceTOTPCheckerQuery$data = {
  readonly user: {
    readonly totp_activated: boolean | null | undefined;
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
    "name": "email"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "isNotSupportTotp"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "email",
    "variableName": "email"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "totp_activated",
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
        "args": (v1/*: any*/),
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "user",
        "plural": false,
        "selections": [
          (v2/*: any*/),
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
        "args": (v1/*: any*/),
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "user",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "email",
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
    "cacheID": "70674447a73f84f7a45b697e1500898b",
    "id": null,
    "metadata": {},
    "name": "ForceTOTPCheckerQuery",
    "operationKind": "query",
    "text": "query ForceTOTPCheckerQuery(\n  $email: String\n  $isNotSupportTotp: Boolean!\n) {\n  user(email: $email) {\n    totp_activated @skipOnClient(if: $isNotSupportTotp)\n    ...TOTPActivateModalFragment\n    id\n  }\n}\n\nfragment TOTPActivateModalFragment on User {\n  email\n  totp_activated @skipOnClient(if: $isNotSupportTotp)\n}\n"
  }
};
})();

(node as any).hash = "fb9cf30eac56ebd925f7570a79eb380f";

export default node;

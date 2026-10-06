/**
 * @generated SignedSource<<be4e61670061cef263a8976b69e4d5ad>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type useUnblockUserLoginMutation$variables = {
  email: string;
  includeUsername: boolean;
  username: string;
};
export type useUnblockUserLoginMutation$data = {
  readonly byEmail: {
    readonly success: boolean;
  } | null | undefined;
  readonly byUsername?: {
    readonly success: boolean;
  } | null | undefined;
};
export type useUnblockUserLoginMutation = {
  response: useUnblockUserLoginMutation$data;
  variables: useUnblockUserLoginMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "email"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "includeUsername"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "username"
},
v3 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "success",
    "storageKey": null
  }
],
v4 = [
  {
    "alias": "byEmail",
    "args": [
      {
        "kind": "Variable",
        "name": "username",
        "variableName": "email"
      }
    ],
    "concreteType": "UnblockUserPayload",
    "kind": "LinkedField",
    "name": "adminUnblockUser",
    "plural": false,
    "selections": (v3/*: any*/),
    "storageKey": null
  },
  {
    "condition": "includeUsername",
    "kind": "Condition",
    "passingValue": true,
    "selections": [
      {
        "alias": "byUsername",
        "args": [
          {
            "kind": "Variable",
            "name": "username",
            "variableName": "username"
          }
        ],
        "concreteType": "UnblockUserPayload",
        "kind": "LinkedField",
        "name": "adminUnblockUser",
        "plural": false,
        "selections": (v3/*: any*/),
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
    "name": "useUnblockUserLoginMutation",
    "selections": (v4/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v2/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Operation",
    "name": "useUnblockUserLoginMutation",
    "selections": (v4/*: any*/)
  },
  "params": {
    "cacheID": "7972ca51932f24ece79b9773e94487b0",
    "id": null,
    "metadata": {},
    "name": "useUnblockUserLoginMutation",
    "operationKind": "mutation",
    "text": "mutation useUnblockUserLoginMutation(\n  $email: String!\n  $username: String!\n  $includeUsername: Boolean!\n) {\n  byEmail: adminUnblockUser(username: $email) {\n    success\n  }\n  byUsername: adminUnblockUser(username: $username) @include(if: $includeUsername) {\n    success\n  }\n}\n"
  }
};
})();

(node as any).hash = "90dd5246965b3df330d033a039cf7c5f";

export default node;

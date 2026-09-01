/**
 * @generated SignedSource<<e51c14e4939561ad646cca58dcc02041>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BulkPurgeUsersV2Input = {
  options?: BulkPurgeUsersV2Options | null | undefined;
  userIds: ReadonlyArray<string>;
};
export type BulkPurgeUsersV2Options = {
  delegateEndpointOwnership?: boolean;
  purgeSharedVfolders?: boolean;
};
export type PurgeUsersModalBulkMutation$variables = {
  input: BulkPurgeUsersV2Input;
};
export type PurgeUsersModalBulkMutation$data = {
  readonly adminBulkPurgeUsersV2: {
    readonly failed: ReadonlyArray<{
      readonly message: string;
      readonly userId: string;
    }>;
    readonly successes: ReadonlyArray<string>;
  } | null | undefined;
};
export type PurgeUsersModalBulkMutation = {
  response: PurgeUsersModalBulkMutation$data;
  variables: PurgeUsersModalBulkMutation$variables;
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
    "concreteType": "BulkPurgeUsersV2Payload",
    "kind": "LinkedField",
    "name": "adminBulkPurgeUsersV2",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "successes",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "BulkPurgeUserV2Error",
        "kind": "LinkedField",
        "name": "failed",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "userId",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "message",
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
    "name": "PurgeUsersModalBulkMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "PurgeUsersModalBulkMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "939e3307b8f6fd476f2ed0651f4110ef",
    "id": null,
    "metadata": {},
    "name": "PurgeUsersModalBulkMutation",
    "operationKind": "mutation",
    "text": "mutation PurgeUsersModalBulkMutation(\n  $input: BulkPurgeUsersV2Input!\n) {\n  adminBulkPurgeUsersV2(input: $input) {\n    successes\n    failed {\n      userId\n      message\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "1d075e5a3d2c71049bfa18584c70a430";

export default node;

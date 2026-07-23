/**
 * @generated SignedSource<<f9f3afdfc167cac3c492a44a450e4dec>>
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
    readonly purgedCount: number;
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
        "name": "purgedCount",
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
    "cacheID": "a34039d89cddc22073c15447b5f4fbc0",
    "id": null,
    "metadata": {},
    "name": "PurgeUsersModalBulkMutation",
    "operationKind": "mutation",
    "text": "mutation PurgeUsersModalBulkMutation(\n  $input: BulkPurgeUsersV2Input!\n) {\n  adminBulkPurgeUsersV2(input: $input) {\n    purgedCount\n    failed {\n      userId\n      message\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "5fc5df3e560d0004beb729841ee30b31";

export default node;

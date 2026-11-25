/**
 * @generated SignedSource<<f0da4a56c0707a7b9a7894b2d366fbd3>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type PermissionBit = "CREATE" | "HARD_DELETE" | "READ" | "SOFT_DELETE" | "UPDATE" | "%future added value";
export type PermissionTarget = {
  entityType: string;
  scopeId: string;
  scopeType: string;
};
export type useVFolderInvitationsProjectAnswerersQuery$variables = {
  targets: ReadonlyArray<PermissionTarget>;
};
export type useVFolderInvitationsProjectAnswerersQuery$data = {
  readonly myAtomicBulkScopePermissions: {
    readonly items: ReadonlyArray<{
      readonly permissions: ReadonlyArray<PermissionBit>;
      readonly scopeId: string;
    }>;
  } | null | undefined;
};
export type useVFolderInvitationsProjectAnswerersQuery = {
  response: useVFolderInvitationsProjectAnswerersQuery$data;
  variables: useVFolderInvitationsProjectAnswerersQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "targets"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "fields": [
          {
            "kind": "Variable",
            "name": "targets",
            "variableName": "targets"
          }
        ],
        "kind": "ObjectValue",
        "name": "input"
      }
    ],
    "concreteType": "MyAtomicBulkScopePermissionsPayload",
    "kind": "LinkedField",
    "name": "myAtomicBulkScopePermissions",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "ScopeEntityPermission",
        "kind": "LinkedField",
        "name": "items",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "scopeId",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "permissions",
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
    "name": "useVFolderInvitationsProjectAnswerersQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "useVFolderInvitationsProjectAnswerersQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "f5d34b46fb6351ffa0444b8f7e41694b",
    "id": null,
    "metadata": {},
    "name": "useVFolderInvitationsProjectAnswerersQuery",
    "operationKind": "query",
    "text": "query useVFolderInvitationsProjectAnswerersQuery(\n  $targets: [PermissionTarget!]!\n) {\n  myAtomicBulkScopePermissions(input: {targets: $targets}) {\n    items {\n      scopeId\n      permissions\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "0fbd5a4bc7e5a1f95a1d690bc9e8d8a4";

export default node;

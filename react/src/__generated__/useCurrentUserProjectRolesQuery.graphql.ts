/**
 * @generated SignedSource<<d63e217ccf6ef06f58a6325f310d1d82>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { Result } from "relay-runtime";
export type PermissionBit = "CREATE" | "HARD_DELETE" | "READ" | "SOFT_DELETE" | "UPDATE" | "%future added value";
export type PermissionTarget = {
  entityType: string;
  scopeId: string;
  scopeType: string;
};
export type useCurrentUserProjectRolesQuery$variables = {
  targets: ReadonlyArray<PermissionTarget>;
};
export type useCurrentUserProjectRolesQuery$data = {
  readonly projectAdminPermissions: Result<{
    readonly items: ReadonlyArray<{
      readonly permissions: ReadonlyArray<PermissionBit>;
      readonly scopeId: string;
    }>;
  } | null | undefined, unknown>;
};
export type useCurrentUserProjectRolesQuery = {
  response: useCurrentUserProjectRolesQuery$data;
  variables: useCurrentUserProjectRolesQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "targets"
  }
],
v1 = {
  "alias": "projectAdminPermissions",
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
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "useCurrentUserProjectRolesQuery",
    "selections": [
      {
        "kind": "CatchField",
        "field": (v1/*: any*/),
        "to": "RESULT"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "useCurrentUserProjectRolesQuery",
    "selections": [
      (v1/*: any*/)
    ]
  },
  "params": {
    "cacheID": "b9fc0da4b7cedf1483612e12c5374484",
    "id": null,
    "metadata": {},
    "name": "useCurrentUserProjectRolesQuery",
    "operationKind": "query",
    "text": "query useCurrentUserProjectRolesQuery(\n  $targets: [PermissionTarget!]!\n) {\n  projectAdminPermissions: myAtomicBulkScopePermissions(input: {targets: $targets}) {\n    items {\n      scopeId\n      permissions\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "ef8755038c81acbab86bac59692baa88";

export default node;

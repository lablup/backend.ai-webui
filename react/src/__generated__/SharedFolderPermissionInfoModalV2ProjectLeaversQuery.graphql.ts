/**
 * @generated SignedSource<<fe67659cadc1ed5562c91ac003c63368>>
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
export type SharedFolderPermissionInfoModalV2ProjectLeaversQuery$variables = {
  targets: ReadonlyArray<PermissionTarget>;
};
export type SharedFolderPermissionInfoModalV2ProjectLeaversQuery$data = {
  readonly myAtomicBulkScopePermissions: {
    readonly items: ReadonlyArray<{
      readonly permissions: ReadonlyArray<PermissionBit>;
      readonly scopeId: string;
    }>;
  } | null | undefined;
};
export type SharedFolderPermissionInfoModalV2ProjectLeaversQuery = {
  response: SharedFolderPermissionInfoModalV2ProjectLeaversQuery$data;
  variables: SharedFolderPermissionInfoModalV2ProjectLeaversQuery$variables;
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
    "name": "SharedFolderPermissionInfoModalV2ProjectLeaversQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "SharedFolderPermissionInfoModalV2ProjectLeaversQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "5bac91c97629328b65e386c551d9d9b3",
    "id": null,
    "metadata": {},
    "name": "SharedFolderPermissionInfoModalV2ProjectLeaversQuery",
    "operationKind": "query",
    "text": "query SharedFolderPermissionInfoModalV2ProjectLeaversQuery(\n  $targets: [PermissionTarget!]!\n) {\n  myAtomicBulkScopePermissions(input: {targets: $targets}) {\n    items {\n      scopeId\n      permissions\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "90e016d54f49ed9842a04d566c8090e5";

export default node;

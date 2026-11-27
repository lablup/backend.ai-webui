/**
 * @generated SignedSource<<bb290f355ebb92fef4c47806d89cc27f>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type PermissionBit = "CREATE" | "HARD_DELETE" | "READ" | "SOFT_DELETE" | "UPDATE" | "%future added value";
export type FolderCreateModalPermissionQuery$variables = {
  projectId: string;
};
export type FolderCreateModalPermissionQuery$data = {
  readonly myScopePermissions: {
    readonly item: {
      readonly permissions: ReadonlyArray<PermissionBit>;
    };
  } | null | undefined;
};
export type FolderCreateModalPermissionQuery = {
  response: FolderCreateModalPermissionQuery$data;
  variables: FolderCreateModalPermissionQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "projectId"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "fields": [
          {
            "fields": [
              {
                "kind": "Literal",
                "name": "entityType",
                "value": "vfolder"
              },
              {
                "kind": "Variable",
                "name": "scopeId",
                "variableName": "projectId"
              },
              {
                "kind": "Literal",
                "name": "scopeType",
                "value": "project"
              }
            ],
            "kind": "ObjectValue",
            "name": "target"
          }
        ],
        "kind": "ObjectValue",
        "name": "input"
      }
    ],
    "concreteType": "MyScopePermissionsPayload",
    "kind": "LinkedField",
    "name": "myScopePermissions",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "ScopeEntityPermission",
        "kind": "LinkedField",
        "name": "item",
        "plural": false,
        "selections": [
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
    "name": "FolderCreateModalPermissionQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "FolderCreateModalPermissionQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "7eb68cf6f19d5a704d5c3384481aeb3e",
    "id": null,
    "metadata": {},
    "name": "FolderCreateModalPermissionQuery",
    "operationKind": "query",
    "text": "query FolderCreateModalPermissionQuery(\n  $projectId: UUID!\n) {\n  myScopePermissions(input: {target: {scopeType: \"project\", scopeId: $projectId, entityType: \"vfolder\"}}) {\n    item {\n      permissions\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "8067e8be7c6d01e0f19603af09d11b76";

export default node;

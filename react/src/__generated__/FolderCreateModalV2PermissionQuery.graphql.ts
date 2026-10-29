/**
 * @generated SignedSource<<500fdb99bb03fb9bb9c5badfd47753c7>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type PermissionBit = "CREATE" | "HARD_DELETE" | "READ" | "SOFT_DELETE" | "UPDATE" | "%future added value";
export type FolderCreateModalV2PermissionQuery$variables = {
  projectId: string;
};
export type FolderCreateModalV2PermissionQuery$data = {
  readonly myScopePermissions: {
    readonly item: {
      readonly permissions: ReadonlyArray<PermissionBit>;
    };
  } | null | undefined;
};
export type FolderCreateModalV2PermissionQuery = {
  response: FolderCreateModalV2PermissionQuery$data;
  variables: FolderCreateModalV2PermissionQuery$variables;
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
    "name": "FolderCreateModalV2PermissionQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "FolderCreateModalV2PermissionQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "063c57312c3cf114f7a4630dd322d0ae",
    "id": null,
    "metadata": {},
    "name": "FolderCreateModalV2PermissionQuery",
    "operationKind": "query",
    "text": "query FolderCreateModalV2PermissionQuery(\n  $projectId: UUID!\n) {\n  myScopePermissions(input: {target: {scopeType: \"project\", scopeId: $projectId, entityType: \"vfolder\"}}) {\n    item {\n      permissions\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "b4e8d734f0789dade649573239869125";

export default node;

/**
 * @generated SignedSource<<4247299d8135d5590e5c47075bf633f0>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type PermissionBit = "CREATE" | "HARD_DELETE" | "READ" | "SOFT_DELETE" | "UPDATE" | "%future added value";
export type FolderCreateModalAutoMountPermissionQuery$variables = {
  scopeId: string;
  scopeType: string;
};
export type FolderCreateModalAutoMountPermissionQuery$data = {
  readonly myScopePermissions: {
    readonly item: {
      readonly permissions: ReadonlyArray<PermissionBit>;
    };
  } | null | undefined;
};
export type FolderCreateModalAutoMountPermissionQuery = {
  response: FolderCreateModalAutoMountPermissionQuery$data;
  variables: FolderCreateModalAutoMountPermissionQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "scopeId"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "scopeType"
},
v2 = [
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
                "value": "vfolder_auto_mount"
              },
              {
                "kind": "Variable",
                "name": "scopeId",
                "variableName": "scopeId"
              },
              {
                "kind": "Variable",
                "name": "scopeType",
                "variableName": "scopeType"
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
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "FolderCreateModalAutoMountPermissionQuery",
    "selections": (v2/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "FolderCreateModalAutoMountPermissionQuery",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "5383df8f12b85b2bd83c0a6b6378fce5",
    "id": null,
    "metadata": {},
    "name": "FolderCreateModalAutoMountPermissionQuery",
    "operationKind": "query",
    "text": "query FolderCreateModalAutoMountPermissionQuery(\n  $scopeType: String!\n  $scopeId: UUID!\n) {\n  myScopePermissions(input: {target: {scopeType: $scopeType, scopeId: $scopeId, entityType: \"vfolder_auto_mount\"}}) {\n    item {\n      permissions\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "61d6ec8eabbd270e6378712714f01140";

export default node;

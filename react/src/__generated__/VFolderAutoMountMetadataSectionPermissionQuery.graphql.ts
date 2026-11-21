/**
 * @generated SignedSource<<20de15cf33e83fbab7bd841b4696021a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type PermissionBit = "CREATE" | "HARD_DELETE" | "READ" | "SOFT_DELETE" | "UPDATE" | "%future added value";
export type VFolderAutoMountMetadataSectionPermissionQuery$variables = {
  scopeId: string;
  scopeType: string;
};
export type VFolderAutoMountMetadataSectionPermissionQuery$data = {
  readonly myScopePermissions: {
    readonly item: {
      readonly permissions: ReadonlyArray<PermissionBit>;
    };
  } | null | undefined;
};
export type VFolderAutoMountMetadataSectionPermissionQuery = {
  response: VFolderAutoMountMetadataSectionPermissionQuery$data;
  variables: VFolderAutoMountMetadataSectionPermissionQuery$variables;
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
    "name": "VFolderAutoMountMetadataSectionPermissionQuery",
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
    "name": "VFolderAutoMountMetadataSectionPermissionQuery",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "66daad7b484585ae6025c4178fc5e613",
    "id": null,
    "metadata": {},
    "name": "VFolderAutoMountMetadataSectionPermissionQuery",
    "operationKind": "query",
    "text": "query VFolderAutoMountMetadataSectionPermissionQuery(\n  $scopeType: String!\n  $scopeId: UUID!\n) {\n  myScopePermissions(input: {target: {scopeType: $scopeType, scopeId: $scopeId, entityType: \"vfolder_auto_mount\"}}) {\n    item {\n      permissions\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "bf478fa8dce393db1d1452ae9e9a5e4f";

export default node;

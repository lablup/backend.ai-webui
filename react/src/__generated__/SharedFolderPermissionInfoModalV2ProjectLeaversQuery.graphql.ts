/**
 * @generated SignedSource<<8402d825a92607f083837060aa12aeb1>>
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
  projectScope: PermissionTarget;
};
export type SharedFolderPermissionInfoModalV2ProjectLeaversQuery$data = {
  readonly myScopePermissions: {
    readonly item: {
      readonly permissions: ReadonlyArray<PermissionBit>;
    };
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
    "name": "projectScope"
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
            "name": "target",
            "variableName": "projectScope"
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
    "cacheID": "c3b664cda626c5358d544dcf7f985f82",
    "id": null,
    "metadata": {},
    "name": "SharedFolderPermissionInfoModalV2ProjectLeaversQuery",
    "operationKind": "query",
    "text": "query SharedFolderPermissionInfoModalV2ProjectLeaversQuery(\n  $projectScope: PermissionTarget!\n) {\n  myScopePermissions(input: {target: $projectScope}) {\n    item {\n      permissions\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "77776da3e8d40fdf550efb25ec818e7c";

export default node;

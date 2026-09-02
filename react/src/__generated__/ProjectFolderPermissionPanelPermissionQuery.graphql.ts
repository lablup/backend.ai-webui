/**
 * @generated SignedSource<<892f201dec79ec4b073b46f1573c7666>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ProjectFolderPermissionPanelPermissionQuery$variables = Record<PropertyKey, never>;
export type ProjectFolderPermissionPanelPermissionQuery$data = {
  readonly vfolder_host_permissions: {
    readonly " $fragmentSpreads": FragmentRefs<"DomainStoragePermissionTable_permissionFrgmt" | "ProjectStoragePermissionTable_permissionFrgmt">;
  } | null | undefined;
};
export type ProjectFolderPermissionPanelPermissionQuery = {
  response: ProjectFolderPermissionPanelPermissionQuery$data;
  variables: ProjectFolderPermissionPanelPermissionQuery$variables;
};

const node: ConcreteRequest = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "ProjectFolderPermissionPanelPermissionQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "PredefinedAtomicPermission",
        "kind": "LinkedField",
        "name": "vfolder_host_permissions",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "DomainStoragePermissionTable_permissionFrgmt"
          },
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "ProjectStoragePermissionTable_permissionFrgmt"
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "ProjectFolderPermissionPanelPermissionQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "PredefinedAtomicPermission",
        "kind": "LinkedField",
        "name": "vfolder_host_permissions",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "vfolder_host_permission_list",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "ad177fbabc53ce18a3d074ec805bdaae",
    "id": null,
    "metadata": {},
    "name": "ProjectFolderPermissionPanelPermissionQuery",
    "operationKind": "query",
    "text": "query ProjectFolderPermissionPanelPermissionQuery {\n  vfolder_host_permissions {\n    ...DomainStoragePermissionTable_permissionFrgmt\n    ...ProjectStoragePermissionTable_permissionFrgmt\n  }\n}\n\nfragment DomainStoragePermissionTable_permissionFrgmt on PredefinedAtomicPermission {\n  vfolder_host_permission_list\n}\n\nfragment ProjectStoragePermissionTable_permissionFrgmt on PredefinedAtomicPermission {\n  vfolder_host_permission_list\n}\n"
  }
};

(node as any).hash = "480544fc21675a7d6e2a1441d5bca126";

export default node;

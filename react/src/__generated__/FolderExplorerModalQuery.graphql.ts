/**
 * @generated SignedSource<<b39e8c29c06dc23f9bb6bb7728abfc92>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type FolderExplorerModalQuery$variables = {
  vfolderGlobalId: string;
};
export type FolderExplorerModalQuery$data = {
  readonly vfolder_node: {
    readonly group: string | null | undefined;
    readonly group_name: string | null | undefined;
    readonly host: string | null | undefined;
    readonly id: string;
    readonly name: string | null | undefined;
    readonly permissions: ReadonlyArray<any | null | undefined> | null | undefined;
    readonly unmanaged_path: string | null | undefined;
    readonly " $fragmentSpreads": FragmentRefs<"FolderExplorerHeaderFragment" | "VFolderNameTitleNodeFragment" | "VFolderNodeDescriptionFragment">;
  } | null | undefined;
};
export type FolderExplorerModalQuery = {
  response: FolderExplorerModalQuery$data;
  variables: FolderExplorerModalQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "vfolderGlobalId"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "vfolderGlobalId"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "group",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "group_name",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "unmanaged_path",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "permissions",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "host",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "FolderExplorerModalQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "VirtualFolderNode",
        "kind": "LinkedField",
        "name": "vfolder_node",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/),
          (v4/*: any*/),
          (v5/*: any*/),
          (v6/*: any*/),
          (v7/*: any*/),
          (v8/*: any*/),
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "FolderExplorerHeaderFragment"
          },
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "VFolderNodeDescriptionFragment"
          },
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "VFolderNameTitleNodeFragment"
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "FolderExplorerModalQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "VirtualFolderNode",
        "kind": "LinkedField",
        "name": "vfolder_node",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/),
          (v4/*: any*/),
          (v5/*: any*/),
          (v6/*: any*/),
          (v7/*: any*/),
          (v8/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "user",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "permission",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "status",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "quota_scope_id",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "user_email",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "creator",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "usage_mode",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "ownership_type",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "max_files",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "max_size",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "created_at",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "last_used",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "num_files",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "cur_size",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "cloneable",
            "storageKey": null
          },
          (v5/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "aa7d23c4c129717653b4c4f26ccc8468",
    "id": null,
    "metadata": {},
    "name": "FolderExplorerModalQuery",
    "operationKind": "query",
    "text": "query FolderExplorerModalQuery(\n  $vfolderGlobalId: String!\n) {\n  vfolder_node(id: $vfolderGlobalId) {\n    group\n    group_name\n    unmanaged_path @since(version: \"25.04.0\")\n    permissions\n    host\n    id\n    name\n    ...FolderExplorerHeaderFragment\n    ...VFolderNodeDescriptionFragment\n    ...VFolderNameTitleNodeFragment\n  }\n}\n\nfragment EditableVFolderNameFragment on VirtualFolderNode {\n  id\n  name\n  user\n  group\n  status\n}\n\nfragment FileBrowserButtonFragment on VirtualFolderNode {\n  id\n  host\n}\n\nfragment FolderExplorerHeaderFragment on VirtualFolderNode {\n  id\n  user\n  permission\n  unmanaged_path @since(version: \"25.04.0\")\n  ...VFolderNameTitleNodeFragment\n  ...VFolderNodeIdenticonFragment\n  ...EditableVFolderNameFragment\n  ...FileBrowserButtonFragment\n  ...SFTPServerButtonFragment\n}\n\nfragment SFTPServerButtonFragment on VirtualFolderNode {\n  id\n  host\n}\n\nfragment VFolderNameTitleNodeFragment on VirtualFolderNode {\n  name\n}\n\nfragment VFolderNodeDescriptionFragment on VirtualFolderNode {\n  id\n  host\n  quota_scope_id\n  user\n  user_email\n  group\n  group_name\n  creator\n  usage_mode\n  permission\n  ownership_type\n  max_files\n  max_size\n  created_at\n  last_used\n  num_files\n  cur_size\n  cloneable\n  status\n  permissions @since(version: \"24.09.0\")\n  unmanaged_path @since(version: \"25.04.0\")\n  ...VFolderPermissionCellFragment\n  ...useVirtualFolderNodePathFragment\n}\n\nfragment VFolderNodeIdenticonFragment on VirtualFolderNode {\n  id\n}\n\nfragment VFolderPermissionCellFragment on VirtualFolderNode {\n  permissions\n}\n\nfragment useVirtualFolderNodePathFragment on VirtualFolderNode {\n  id\n  host\n  quota_scope_id\n  user\n  user_email\n  group\n  group_name\n  creator\n  usage_mode\n  permission\n  ownership_type\n  max_files\n  max_size\n  created_at\n  last_used\n  num_files\n  cur_size\n  cloneable\n  status\n  permissions @since(version: \"24.09.0\")\n}\n"
  }
};
})();

(node as any).hash = "bc8ed85ec64ce6416231f71a40388f03";

export default node;

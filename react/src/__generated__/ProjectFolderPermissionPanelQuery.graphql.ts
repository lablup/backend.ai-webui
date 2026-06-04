/**
 * @generated SignedSource<<4114d20b9a1f049fa5f4fbf45968cea1>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ProjectFolderPermissionPanelQuery$variables = {
  domainName?: string | null | undefined;
  skipDomain: boolean;
};
export type ProjectFolderPermissionPanelQuery$data = {
  readonly domain?: {
    readonly " $fragmentSpreads": FragmentRefs<"DomainStoragePermissionTable_domainFrgmt" | "ProjectStoragePermissionTable_domainFrgmt">;
  } | null | undefined;
  readonly vfolder_host_permissions: {
    readonly vfolder_host_permission_list: ReadonlyArray<string | null | undefined> | null | undefined;
  } | null | undefined;
};
export type ProjectFolderPermissionPanelQuery = {
  response: ProjectFolderPermissionPanelQuery$data;
  variables: ProjectFolderPermissionPanelQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "domainName"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "skipDomain"
  }
],
v1 = {
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
},
v2 = [
  {
    "kind": "Variable",
    "name": "name",
    "variableName": "domainName"
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "ProjectFolderPermissionPanelQuery",
    "selections": [
      (v1/*: any*/),
      {
        "condition": "skipDomain",
        "kind": "Condition",
        "passingValue": false,
        "selections": [
          {
            "alias": null,
            "args": (v2/*: any*/),
            "concreteType": "Domain",
            "kind": "LinkedField",
            "name": "domain",
            "plural": false,
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "DomainStoragePermissionTable_domainFrgmt"
              },
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "ProjectStoragePermissionTable_domainFrgmt"
              }
            ],
            "storageKey": null
          }
        ]
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ProjectFolderPermissionPanelQuery",
    "selections": [
      (v1/*: any*/),
      {
        "condition": "skipDomain",
        "kind": "Condition",
        "passingValue": false,
        "selections": [
          {
            "alias": null,
            "args": (v2/*: any*/),
            "concreteType": "Domain",
            "kind": "LinkedField",
            "name": "domain",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "name",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "allowed_vfolder_hosts",
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ]
      }
    ]
  },
  "params": {
    "cacheID": "8c969e4ac87a0e7752c19b13cf22a49e",
    "id": null,
    "metadata": {},
    "name": "ProjectFolderPermissionPanelQuery",
    "operationKind": "query",
    "text": "query ProjectFolderPermissionPanelQuery(\n  $domainName: String\n  $skipDomain: Boolean!\n) {\n  vfolder_host_permissions {\n    vfolder_host_permission_list\n  }\n  domain(name: $domainName) @skip(if: $skipDomain) {\n    ...DomainStoragePermissionTable_domainFrgmt\n    ...ProjectStoragePermissionTable_domainFrgmt\n  }\n}\n\nfragment DomainStoragePermissionTable_domainFrgmt on Domain {\n  name\n  allowed_vfolder_hosts\n}\n\nfragment ProjectStoragePermissionTable_domainFrgmt on Domain {\n  allowed_vfolder_hosts\n}\n"
  }
};
})();

(node as any).hash = "1e3c4b45d7fb84a3e2a8c2205c985208";

export default node;

/**
 * @generated SignedSource<<28a6d924cfe06d808389bacc8e887de7>>
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
};
export type ProjectFolderPermissionPanelQuery$data = {
  readonly domain: {
    readonly " $fragmentSpreads": FragmentRefs<"DomainStoragePermissionTable_domainFrgmt" | "ProjectStoragePermissionTable_domainFrgmt">;
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
  }
],
v1 = [
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
      {
        "alias": null,
        "args": (v1/*: any*/),
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
      {
        "alias": null,
        "args": (v1/*: any*/),
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
  },
  "params": {
    "cacheID": "1774faebe1b1e9474b78db05ccdf993b",
    "id": null,
    "metadata": {},
    "name": "ProjectFolderPermissionPanelQuery",
    "operationKind": "query",
    "text": "query ProjectFolderPermissionPanelQuery(\n  $domainName: String\n) {\n  domain(name: $domainName) {\n    ...DomainStoragePermissionTable_domainFrgmt\n    ...ProjectStoragePermissionTable_domainFrgmt\n  }\n}\n\nfragment DomainStoragePermissionTable_domainFrgmt on Domain {\n  name\n  allowed_vfolder_hosts\n}\n\nfragment ProjectStoragePermissionTable_domainFrgmt on Domain {\n  name\n  allowed_vfolder_hosts\n}\n"
  }
};
})();

(node as any).hash = "67a68b8a95195d7ae51faa2bc3a0e031";

export default node;

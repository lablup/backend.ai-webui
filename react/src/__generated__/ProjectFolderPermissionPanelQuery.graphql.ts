/**
 * @generated SignedSource<<bdff4ef8e97e99adb4c047c6a1618c52>>
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
        "condition": "skipDomain",
        "kind": "Condition",
        "passingValue": false,
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
      {
        "condition": "skipDomain",
        "kind": "Condition",
        "passingValue": false,
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
      }
    ]
  },
  "params": {
    "cacheID": "0a2c06f42cb22706f72e40a7739de903",
    "id": null,
    "metadata": {},
    "name": "ProjectFolderPermissionPanelQuery",
    "operationKind": "query",
    "text": "query ProjectFolderPermissionPanelQuery(\n  $domainName: String\n  $skipDomain: Boolean!\n) {\n  domain(name: $domainName) @skip(if: $skipDomain) {\n    ...DomainStoragePermissionTable_domainFrgmt\n    ...ProjectStoragePermissionTable_domainFrgmt\n  }\n}\n\nfragment DomainStoragePermissionTable_domainFrgmt on Domain {\n  name\n  allowed_vfolder_hosts\n}\n\nfragment ProjectStoragePermissionTable_domainFrgmt on Domain {\n  name\n  allowed_vfolder_hosts\n}\n"
  }
};
})();

(node as any).hash = "2c9e3593adf4cf22598b733adfb05687";

export default node;

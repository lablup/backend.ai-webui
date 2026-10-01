/**
 * @generated SignedSource<<6406e9fcf7f5a4d959c0ba96dbbfbf3f>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ProjectResourceGroupWarningIconQuery$variables = {
  domainName: string;
  isSuperAdmin: boolean;
  projectId: string;
  resourceGroupName: string;
};
export type ProjectResourceGroupWarningIconQuery$data = {
  readonly adminAllowedProjectsForResourceGroupV2?: {
    readonly items: ReadonlyArray<string>;
  } | null | undefined;
  readonly adminAllowedResourceGroupsForDomainV2?: {
    readonly items: ReadonlyArray<string>;
  } | null | undefined;
  readonly domain?: {
    readonly scaling_groups: ReadonlyArray<string | null | undefined> | null | undefined;
  } | null | undefined;
  readonly group?: {
    readonly scaling_groups: ReadonlyArray<string | null | undefined> | null | undefined;
  } | null | undefined;
};
export type ProjectResourceGroupWarningIconQuery = {
  response: ProjectResourceGroupWarningIconQuery$data;
  variables: ProjectResourceGroupWarningIconQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "domainName"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "isSuperAdmin"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "projectId"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "resourceGroupName"
},
v4 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "items",
    "storageKey": null
  }
],
v5 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "scaling_groups",
    "storageKey": null
  }
],
v6 = [
  {
    "condition": "isSuperAdmin",
    "kind": "Condition",
    "passingValue": true,
    "selections": [
      {
        "alias": null,
        "args": [
          {
            "kind": "Variable",
            "name": "resourceGroupName",
            "variableName": "resourceGroupName"
          }
        ],
        "concreteType": "AllowedProjectsPayload",
        "kind": "LinkedField",
        "name": "adminAllowedProjectsForResourceGroupV2",
        "plural": false,
        "selections": (v4/*: any*/),
        "storageKey": null
      },
      {
        "alias": null,
        "args": [
          {
            "kind": "Variable",
            "name": "domainName",
            "variableName": "domainName"
          }
        ],
        "concreteType": "AllowedResourceGroupsPayload",
        "kind": "LinkedField",
        "name": "adminAllowedResourceGroupsForDomainV2",
        "plural": false,
        "selections": (v4/*: any*/),
        "storageKey": null
      }
    ]
  },
  {
    "condition": "isSuperAdmin",
    "kind": "Condition",
    "passingValue": false,
    "selections": [
      {
        "alias": null,
        "args": [
          {
            "kind": "Variable",
            "name": "domain_name",
            "variableName": "domainName"
          },
          {
            "kind": "Variable",
            "name": "id",
            "variableName": "projectId"
          }
        ],
        "concreteType": "Group",
        "kind": "LinkedField",
        "name": "group",
        "plural": false,
        "selections": (v5/*: any*/),
        "storageKey": null
      },
      {
        "alias": null,
        "args": [
          {
            "kind": "Variable",
            "name": "name",
            "variableName": "domainName"
          }
        ],
        "concreteType": "Domain",
        "kind": "LinkedField",
        "name": "domain",
        "plural": false,
        "selections": (v5/*: any*/),
        "storageKey": null
      }
    ]
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "ProjectResourceGroupWarningIconQuery",
    "selections": (v6/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v2/*: any*/),
      (v0/*: any*/),
      (v3/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Operation",
    "name": "ProjectResourceGroupWarningIconQuery",
    "selections": (v6/*: any*/)
  },
  "params": {
    "cacheID": "78656bb05f907ef4e5cbf3b803ab8ff5",
    "id": null,
    "metadata": {},
    "name": "ProjectResourceGroupWarningIconQuery",
    "operationKind": "query",
    "text": "query ProjectResourceGroupWarningIconQuery(\n  $projectId: UUID!\n  $domainName: String!\n  $resourceGroupName: String!\n  $isSuperAdmin: Boolean!\n) {\n  adminAllowedProjectsForResourceGroupV2(resourceGroupName: $resourceGroupName) @include(if: $isSuperAdmin) {\n    items\n  }\n  adminAllowedResourceGroupsForDomainV2(domainName: $domainName) @include(if: $isSuperAdmin) {\n    items\n  }\n  group(id: $projectId, domain_name: $domainName) @skip(if: $isSuperAdmin) {\n    scaling_groups\n  }\n  domain(name: $domainName) @skip(if: $isSuperAdmin) {\n    scaling_groups\n  }\n}\n"
  }
};
})();

(node as any).hash = "d034dd8e163d1f7e11b077665e91ac1a";

export default node;

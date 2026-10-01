/**
 * @generated SignedSource<<dedcb328055cfdd9e59836cedc054dd9>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ProjectResourceGroupAlertQuery$variables = {
  domainName: string;
  isSuperAdmin: boolean;
  projectId: string;
  resourceGroupName: string;
};
export type ProjectResourceGroupAlertQuery$data = {
  readonly adminAllowedProjectsForResourceGroupV2?: {
    readonly items: ReadonlyArray<string>;
  } | null | undefined;
  readonly group?: {
    readonly scaling_groups: ReadonlyArray<string | null | undefined> | null | undefined;
  } | null | undefined;
};
export type ProjectResourceGroupAlertQuery = {
  response: ProjectResourceGroupAlertQuery$data;
  variables: ProjectResourceGroupAlertQuery$variables;
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
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "items",
            "storageKey": null
          }
        ],
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
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "scaling_groups",
            "storageKey": null
          }
        ],
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
    "name": "ProjectResourceGroupAlertQuery",
    "selections": (v4/*: any*/),
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
    "name": "ProjectResourceGroupAlertQuery",
    "selections": (v4/*: any*/)
  },
  "params": {
    "cacheID": "2a203eeabef3fd7c27b1e5fdc78a0c50",
    "id": null,
    "metadata": {},
    "name": "ProjectResourceGroupAlertQuery",
    "operationKind": "query",
    "text": "query ProjectResourceGroupAlertQuery(\n  $projectId: UUID!\n  $domainName: String!\n  $resourceGroupName: String!\n  $isSuperAdmin: Boolean!\n) {\n  adminAllowedProjectsForResourceGroupV2(resourceGroupName: $resourceGroupName) @include(if: $isSuperAdmin) {\n    items\n  }\n  group(id: $projectId, domain_name: $domainName) @skip(if: $isSuperAdmin) {\n    scaling_groups\n  }\n}\n"
  }
};
})();

(node as any).hash = "166a2ba10c6a0eb7770e7ce0aa6325f0";

export default node;

/**
 * @generated SignedSource<<11cf209ab191d3f926e3c75c585d2796>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type UserResourceGroupAlertQuery$variables = {
  domainName: string;
  isSuperAdmin: boolean;
  projectId: string;
  resourceGroupName: string;
};
export type UserResourceGroupAlertQuery$data = {
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
  readonly projectV2: {
    readonly basicInfo: {
      readonly name: string;
    };
  } | null | undefined;
};
export type UserResourceGroupAlertQuery = {
  response: UserResourceGroupAlertQuery$data;
  variables: UserResourceGroupAlertQuery$variables;
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
v5 = {
  "condition": "isSuperAdmin",
  "kind": "Condition",
  "passingValue": true,
  "selections": [
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
    },
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
    }
  ]
},
v6 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "scaling_groups",
    "storageKey": null
  }
],
v7 = {
  "condition": "isSuperAdmin",
  "kind": "Condition",
  "passingValue": false,
  "selections": [
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
      "selections": (v6/*: any*/),
      "storageKey": null
    },
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
      "selections": (v6/*: any*/),
      "storageKey": null
    }
  ]
},
v8 = [
  {
    "kind": "Variable",
    "name": "projectId",
    "variableName": "projectId"
  }
],
v9 = {
  "alias": null,
  "args": null,
  "concreteType": "ProjectBasicInfo",
  "kind": "LinkedField",
  "name": "basicInfo",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    }
  ],
  "storageKey": null
};
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
    "name": "UserResourceGroupAlertQuery",
    "selections": [
      (v5/*: any*/),
      (v7/*: any*/),
      {
        "alias": null,
        "args": (v8/*: any*/),
        "concreteType": "ProjectV2",
        "kind": "LinkedField",
        "name": "projectV2",
        "plural": false,
        "selections": [
          (v9/*: any*/)
        ],
        "storageKey": null
      }
    ],
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
    "name": "UserResourceGroupAlertQuery",
    "selections": [
      (v5/*: any*/),
      (v7/*: any*/),
      {
        "alias": null,
        "args": (v8/*: any*/),
        "concreteType": "ProjectV2",
        "kind": "LinkedField",
        "name": "projectV2",
        "plural": false,
        "selections": [
          (v9/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "0124f35eb1e61217a353aa04f7e7d16e",
    "id": null,
    "metadata": {},
    "name": "UserResourceGroupAlertQuery",
    "operationKind": "query",
    "text": "query UserResourceGroupAlertQuery(\n  $projectId: UUID!\n  $domainName: String!\n  $resourceGroupName: String!\n  $isSuperAdmin: Boolean!\n) {\n  adminAllowedResourceGroupsForDomainV2(domainName: $domainName) @include(if: $isSuperAdmin) {\n    items\n  }\n  adminAllowedProjectsForResourceGroupV2(resourceGroupName: $resourceGroupName) @include(if: $isSuperAdmin) {\n    items\n  }\n  domain(name: $domainName) @skip(if: $isSuperAdmin) {\n    scaling_groups\n  }\n  group(id: $projectId, domain_name: $domainName) @skip(if: $isSuperAdmin) {\n    scaling_groups\n  }\n  projectV2(projectId: $projectId) {\n    basicInfo {\n      name\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "45fd1b9ccfab09b6b7a7ae1024222b88";

export default node;

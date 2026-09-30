/**
 * @generated SignedSource<<0f3471dbec4c95eb223cb0eb52f0ac7e>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type UserResourceGroupAlertQuery$variables = {
  domainName: string;
  projectId: string;
  supportsAllowedResourceGroupsV2: boolean;
};
export type UserResourceGroupAlertQuery$data = {
  readonly adminAllowedResourceGroupsForDomainV2?: {
    readonly items: ReadonlyArray<string>;
  } | null | undefined;
  readonly adminAllowedResourceGroupsForProjectV2?: {
    readonly items: ReadonlyArray<string>;
  } | null | undefined;
  readonly domain?: {
    readonly scaling_groups: ReadonlyArray<string | null | undefined> | null | undefined;
  } | null | undefined;
  readonly group?: {
    readonly name: string | null | undefined;
    readonly scaling_groups: ReadonlyArray<string | null | undefined> | null | undefined;
  } | null | undefined;
  readonly projectV2?: {
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
  "name": "projectId"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "supportsAllowedResourceGroupsV2"
},
v3 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "items",
    "storageKey": null
  }
],
v4 = {
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
  "selections": (v3/*: any*/),
  "storageKey": null
},
v5 = [
  {
    "kind": "Variable",
    "name": "projectId",
    "variableName": "projectId"
  }
],
v6 = {
  "alias": null,
  "args": (v5/*: any*/),
  "concreteType": "AllowedResourceGroupsPayload",
  "kind": "LinkedField",
  "name": "adminAllowedResourceGroupsForProjectV2",
  "plural": false,
  "selections": (v3/*: any*/),
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "concreteType": "ProjectBasicInfo",
  "kind": "LinkedField",
  "name": "basicInfo",
  "plural": false,
  "selections": [
    (v7/*: any*/)
  ],
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "scaling_groups",
  "storageKey": null
},
v10 = {
  "condition": "supportsAllowedResourceGroupsV2",
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
      "selections": [
        (v9/*: any*/)
      ],
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
      "selections": [
        (v7/*: any*/),
        (v9/*: any*/)
      ],
      "storageKey": null
    }
  ]
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "UserResourceGroupAlertQuery",
    "selections": [
      {
        "condition": "supportsAllowedResourceGroupsV2",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          (v4/*: any*/),
          (v6/*: any*/),
          {
            "alias": null,
            "args": (v5/*: any*/),
            "concreteType": "ProjectV2",
            "kind": "LinkedField",
            "name": "projectV2",
            "plural": false,
            "selections": [
              (v8/*: any*/)
            ],
            "storageKey": null
          }
        ]
      },
      (v10/*: any*/)
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Operation",
    "name": "UserResourceGroupAlertQuery",
    "selections": [
      {
        "condition": "supportsAllowedResourceGroupsV2",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          (v4/*: any*/),
          (v6/*: any*/),
          {
            "alias": null,
            "args": (v5/*: any*/),
            "concreteType": "ProjectV2",
            "kind": "LinkedField",
            "name": "projectV2",
            "plural": false,
            "selections": [
              (v8/*: any*/),
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
      (v10/*: any*/)
    ]
  },
  "params": {
    "cacheID": "ef1deeaba2df195376a9b003b132881c",
    "id": null,
    "metadata": {},
    "name": "UserResourceGroupAlertQuery",
    "operationKind": "query",
    "text": "query UserResourceGroupAlertQuery(\n  $projectId: UUID!\n  $domainName: String!\n  $supportsAllowedResourceGroupsV2: Boolean!\n) {\n  adminAllowedResourceGroupsForDomainV2(domainName: $domainName) @include(if: $supportsAllowedResourceGroupsV2) @since(version: \"26.4.2\") {\n    items\n  }\n  adminAllowedResourceGroupsForProjectV2(projectId: $projectId) @include(if: $supportsAllowedResourceGroupsV2) @since(version: \"26.4.2\") {\n    items\n  }\n  projectV2(projectId: $projectId) @include(if: $supportsAllowedResourceGroupsV2) @since(version: \"26.2.0\") {\n    basicInfo {\n      name\n    }\n    id\n  }\n  domain(name: $domainName) @skip(if: $supportsAllowedResourceGroupsV2) @deprecatedSince(version: \"26.4.2\") {\n    scaling_groups\n  }\n  group(id: $projectId, domain_name: $domainName) @skip(if: $supportsAllowedResourceGroupsV2) @deprecatedSince(version: \"26.4.2\") {\n    name\n    scaling_groups\n  }\n}\n"
  }
};
})();

(node as any).hash = "37beb820d3179a92c8404ad0ddf6685a";

export default node;

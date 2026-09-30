/**
 * @generated SignedSource<<20d6d74fcfd6209d944e218b2033fe32>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ProjectResourceGroupWarningIconQuery$variables = {
  domainName: string;
  projectId: string;
  supportsAllowedResourceGroupsV2: boolean;
};
export type ProjectResourceGroupWarningIconQuery$data = {
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
v4 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "scaling_groups",
    "storageKey": null
  }
],
v5 = [
  {
    "condition": "supportsAllowedResourceGroupsV2",
    "kind": "Condition",
    "passingValue": true,
    "selections": [
      {
        "alias": null,
        "args": [
          {
            "kind": "Variable",
            "name": "projectId",
            "variableName": "projectId"
          }
        ],
        "concreteType": "AllowedResourceGroupsPayload",
        "kind": "LinkedField",
        "name": "adminAllowedResourceGroupsForProjectV2",
        "plural": false,
        "selections": (v3/*: any*/),
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
        "selections": (v3/*: any*/),
        "storageKey": null
      }
    ]
  },
  {
    "condition": "supportsAllowedResourceGroupsV2",
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
        "selections": (v4/*: any*/),
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
        "selections": (v4/*: any*/),
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
      (v2/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "ProjectResourceGroupWarningIconQuery",
    "selections": (v5/*: any*/),
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
    "name": "ProjectResourceGroupWarningIconQuery",
    "selections": (v5/*: any*/)
  },
  "params": {
    "cacheID": "f2c299ac95521fa2f4dfa8f94c70b75d",
    "id": null,
    "metadata": {},
    "name": "ProjectResourceGroupWarningIconQuery",
    "operationKind": "query",
    "text": "query ProjectResourceGroupWarningIconQuery(\n  $projectId: UUID!\n  $domainName: String!\n  $supportsAllowedResourceGroupsV2: Boolean!\n) {\n  adminAllowedResourceGroupsForProjectV2(projectId: $projectId) @include(if: $supportsAllowedResourceGroupsV2) @since(version: \"26.4.2\") {\n    items\n  }\n  adminAllowedResourceGroupsForDomainV2(domainName: $domainName) @include(if: $supportsAllowedResourceGroupsV2) @since(version: \"26.4.2\") {\n    items\n  }\n  group(id: $projectId, domain_name: $domainName) @skip(if: $supportsAllowedResourceGroupsV2) @deprecatedSince(version: \"26.4.2\") {\n    scaling_groups\n  }\n  domain(name: $domainName) @skip(if: $supportsAllowedResourceGroupsV2) @deprecatedSince(version: \"26.4.2\") {\n    scaling_groups\n  }\n}\n"
  }
};
})();

(node as any).hash = "4d6a1bfd25944ef63d009ffca2ad047e";

export default node;

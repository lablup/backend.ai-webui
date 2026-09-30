/**
 * @generated SignedSource<<5383c8512360a776b8e1aa0de0ebc60e>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ProjectResourceGroupAlertQuery$variables = {
  domainName: string;
  projectId: string;
  supportsAllowedResourceGroupsV2: boolean;
};
export type ProjectResourceGroupAlertQuery$data = {
  readonly adminAllowedResourceGroupsForProjectV2?: {
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
  "name": "projectId"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "supportsAllowedResourceGroupsV2"
},
v3 = [
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
      (v2/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "ProjectResourceGroupAlertQuery",
    "selections": (v3/*: any*/),
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
    "name": "ProjectResourceGroupAlertQuery",
    "selections": (v3/*: any*/)
  },
  "params": {
    "cacheID": "239b4b235553d5acea673f324aec6095",
    "id": null,
    "metadata": {},
    "name": "ProjectResourceGroupAlertQuery",
    "operationKind": "query",
    "text": "query ProjectResourceGroupAlertQuery(\n  $projectId: UUID!\n  $domainName: String!\n  $supportsAllowedResourceGroupsV2: Boolean!\n) {\n  adminAllowedResourceGroupsForProjectV2(projectId: $projectId) @include(if: $supportsAllowedResourceGroupsV2) @since(version: \"26.4.2\") {\n    items\n  }\n  group(id: $projectId, domain_name: $domainName) @skip(if: $supportsAllowedResourceGroupsV2) @deprecatedSince(version: \"26.4.2\") {\n    scaling_groups\n  }\n}\n"
  }
};
})();

(node as any).hash = "4ec3a0015ea5a2bbbbeb0110255e3569";

export default node;

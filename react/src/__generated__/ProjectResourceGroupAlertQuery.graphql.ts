/**
 * @generated SignedSource<<8ebc1eb98e64290c52ab02ebda4e22e4>>
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
  "name": "isSuperAdmin"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "projectId"
},
v3 = [
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
      (v2/*: any*/),
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Operation",
    "name": "ProjectResourceGroupAlertQuery",
    "selections": (v3/*: any*/)
  },
  "params": {
    "cacheID": "1886dfec35fa2291b1e36c520e929322",
    "id": null,
    "metadata": {},
    "name": "ProjectResourceGroupAlertQuery",
    "operationKind": "query",
    "text": "query ProjectResourceGroupAlertQuery(\n  $projectId: UUID!\n  $domainName: String!\n  $isSuperAdmin: Boolean!\n) {\n  adminAllowedResourceGroupsForProjectV2(projectId: $projectId) @include(if: $isSuperAdmin) {\n    items\n  }\n  group(id: $projectId, domain_name: $domainName) @skip(if: $isSuperAdmin) {\n    scaling_groups\n  }\n}\n"
  }
};
})();

(node as any).hash = "3279f8ca0c602eb2d6d7074fdc1e84b9";

export default node;

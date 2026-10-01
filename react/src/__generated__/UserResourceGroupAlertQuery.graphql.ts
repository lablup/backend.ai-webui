/**
 * @generated SignedSource<<decb1cf8ea746dd694ccc7ac04bd1f0a>>
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
};
export type UserResourceGroupAlertQuery$data = {
  readonly adminAllowedResourceGroupsForDomainV2: {
    readonly items: ReadonlyArray<string>;
  } | null | undefined;
  readonly adminAllowedResourceGroupsForProjectV2: {
    readonly items: ReadonlyArray<string>;
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
  "name": "projectId"
},
v2 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "items",
    "storageKey": null
  }
],
v3 = {
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
  "selections": (v2/*: any*/),
  "storageKey": null
},
v4 = [
  {
    "kind": "Variable",
    "name": "projectId",
    "variableName": "projectId"
  }
],
v5 = {
  "alias": null,
  "args": (v4/*: any*/),
  "concreteType": "AllowedResourceGroupsPayload",
  "kind": "LinkedField",
  "name": "adminAllowedResourceGroupsForProjectV2",
  "plural": false,
  "selections": (v2/*: any*/),
  "storageKey": null
},
v6 = {
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
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "UserResourceGroupAlertQuery",
    "selections": [
      (v3/*: any*/),
      (v5/*: any*/),
      {
        "alias": null,
        "args": (v4/*: any*/),
        "concreteType": "ProjectV2",
        "kind": "LinkedField",
        "name": "projectV2",
        "plural": false,
        "selections": [
          (v6/*: any*/)
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
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "UserResourceGroupAlertQuery",
    "selections": [
      (v3/*: any*/),
      (v5/*: any*/),
      {
        "alias": null,
        "args": (v4/*: any*/),
        "concreteType": "ProjectV2",
        "kind": "LinkedField",
        "name": "projectV2",
        "plural": false,
        "selections": [
          (v6/*: any*/),
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
    "cacheID": "06dea74c5ccc1ccd7021a0f3ef665cda",
    "id": null,
    "metadata": {},
    "name": "UserResourceGroupAlertQuery",
    "operationKind": "query",
    "text": "query UserResourceGroupAlertQuery(\n  $projectId: UUID!\n  $domainName: String!\n) {\n  adminAllowedResourceGroupsForDomainV2(domainName: $domainName) {\n    items\n  }\n  adminAllowedResourceGroupsForProjectV2(projectId: $projectId) {\n    items\n  }\n  projectV2(projectId: $projectId) {\n    basicInfo {\n      name\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "881cbfa9593b4cc3077b6c4a26a9d2f5";

export default node;

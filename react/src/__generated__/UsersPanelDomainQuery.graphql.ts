/**
 * @generated SignedSource<<838a1ebffa3fdf204622ad491a4cb42f>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type UsersPanelDomainQuery$variables = {
  domainId: string;
};
export type UsersPanelDomainQuery$data = {
  readonly active: {
    readonly count: number;
  } | null | undefined;
  readonly admins: {
    readonly count: number;
  } | null | undefined;
  readonly inactive: {
    readonly count: number;
  } | null | undefined;
};
export type UsersPanelDomainQuery = {
  response: UsersPanelDomainQuery$data;
  variables: UsersPanelDomainQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "domainId"
  }
],
v1 = {
  "equals": "ACTIVE"
},
v2 = {
  "kind": "Literal",
  "name": "limit",
  "value": 1
},
v3 = {
  "fields": [
    {
      "items": [
        {
          "fields": [
            {
              "kind": "Variable",
              "name": "value",
              "variableName": "domainId"
            }
          ],
          "kind": "ObjectValue",
          "name": "domain.0"
        }
      ],
      "kind": "ListValue",
      "name": "domain"
    }
  ],
  "kind": "ObjectValue",
  "name": "scope"
},
v4 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "count",
    "storageKey": null
  }
],
v5 = [
  {
    "alias": "active",
    "args": [
      {
        "kind": "Literal",
        "name": "filter",
        "value": {
          "status": (v1/*: any*/)
        }
      },
      (v2/*: any*/),
      (v3/*: any*/)
    ],
    "concreteType": "UserV2Connection",
    "kind": "LinkedField",
    "name": "scopedUsersV2",
    "plural": false,
    "selections": (v4/*: any*/),
    "storageKey": null
  },
  {
    "alias": "inactive",
    "args": [
      {
        "kind": "Literal",
        "name": "filter",
        "value": {
          "status": {
            "equals": "INACTIVE"
          }
        }
      },
      (v2/*: any*/),
      (v3/*: any*/)
    ],
    "concreteType": "UserV2Connection",
    "kind": "LinkedField",
    "name": "scopedUsersV2",
    "plural": false,
    "selections": (v4/*: any*/),
    "storageKey": null
  },
  {
    "alias": "admins",
    "args": [
      {
        "kind": "Literal",
        "name": "filter",
        "value": {
          "role": {
            "equals": "ADMIN"
          },
          "status": (v1/*: any*/)
        }
      },
      (v2/*: any*/),
      (v3/*: any*/)
    ],
    "concreteType": "UserV2Connection",
    "kind": "LinkedField",
    "name": "scopedUsersV2",
    "plural": false,
    "selections": (v4/*: any*/),
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "UsersPanelDomainQuery",
    "selections": (v5/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "UsersPanelDomainQuery",
    "selections": (v5/*: any*/)
  },
  "params": {
    "cacheID": "7f66dc9c494a1b1e7616240f963b1432",
    "id": null,
    "metadata": {},
    "name": "UsersPanelDomainQuery",
    "operationKind": "query",
    "text": "query UsersPanelDomainQuery(\n  $domainId: UUID!\n) {\n  active: scopedUsersV2(scope: {domain: [{value: $domainId}]}, filter: {status: {equals: ACTIVE}}, limit: 1) {\n    count\n  }\n  inactive: scopedUsersV2(scope: {domain: [{value: $domainId}]}, filter: {status: {equals: INACTIVE}}, limit: 1) {\n    count\n  }\n  admins: scopedUsersV2(scope: {domain: [{value: $domainId}]}, filter: {status: {equals: ACTIVE}, role: {equals: ADMIN}}, limit: 1) {\n    count\n  }\n}\n"
  }
};
})();

(node as any).hash = "507e34216ae95451d85012d3e63a9c9a";

export default node;

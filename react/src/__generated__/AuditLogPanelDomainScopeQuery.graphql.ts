/**
 * @generated SignedSource<<37c4a408bfc0dcb48a825c6e0eee4b13>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type AuditLogPanelDomainScopeQuery$variables = {
  domainName: string;
  limit: number;
  on: boolean;
};
export type AuditLogPanelDomainScopeQuery$data = {
  readonly projects?: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly entityId: string;
      };
    }>;
  } | null | undefined;
  readonly users?: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly entityId: string;
      };
    }>;
  } | null | undefined;
};
export type AuditLogPanelDomainScopeQuery = {
  response: AuditLogPanelDomainScopeQuery$data;
  variables: AuditLogPanelDomainScopeQuery$variables;
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
    "name": "limit"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "on"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "limit",
    "variableName": "limit"
  },
  {
    "fields": [
      {
        "kind": "Variable",
        "name": "domainName",
        "variableName": "domainName"
      }
    ],
    "kind": "ObjectValue",
    "name": "scope"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "entityId",
  "storageKey": null
},
v3 = [
  (v2/*: any*/)
],
v4 = [
  (v2/*: any*/),
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "id",
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "AuditLogPanelDomainScopeQuery",
    "selections": [
      {
        "condition": "on",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "alias": "projects",
            "args": (v1/*: any*/),
            "concreteType": "ProjectV2Connection",
            "kind": "LinkedField",
            "name": "domainProjectsV2",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "ProjectV2Edge",
                "kind": "LinkedField",
                "name": "edges",
                "plural": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "ProjectV2",
                    "kind": "LinkedField",
                    "name": "node",
                    "plural": false,
                    "selections": (v3/*: any*/),
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": "users",
            "args": (v1/*: any*/),
            "concreteType": "UserV2Connection",
            "kind": "LinkedField",
            "name": "domainUsersV2",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "UserV2Edge",
                "kind": "LinkedField",
                "name": "edges",
                "plural": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "UserV2",
                    "kind": "LinkedField",
                    "name": "node",
                    "plural": false,
                    "selections": (v3/*: any*/),
                    "storageKey": null
                  }
                ],
                "storageKey": null
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
    "name": "AuditLogPanelDomainScopeQuery",
    "selections": [
      {
        "condition": "on",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "alias": "projects",
            "args": (v1/*: any*/),
            "concreteType": "ProjectV2Connection",
            "kind": "LinkedField",
            "name": "domainProjectsV2",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "ProjectV2Edge",
                "kind": "LinkedField",
                "name": "edges",
                "plural": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "ProjectV2",
                    "kind": "LinkedField",
                    "name": "node",
                    "plural": false,
                    "selections": (v4/*: any*/),
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": "users",
            "args": (v1/*: any*/),
            "concreteType": "UserV2Connection",
            "kind": "LinkedField",
            "name": "domainUsersV2",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "UserV2Edge",
                "kind": "LinkedField",
                "name": "edges",
                "plural": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "UserV2",
                    "kind": "LinkedField",
                    "name": "node",
                    "plural": false,
                    "selections": (v4/*: any*/),
                    "storageKey": null
                  }
                ],
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
    "cacheID": "49a347bbf4a053f6792d15ce53e2a8b5",
    "id": null,
    "metadata": {},
    "name": "AuditLogPanelDomainScopeQuery",
    "operationKind": "query",
    "text": "query AuditLogPanelDomainScopeQuery(\n  $domainName: String!\n  $limit: Int!\n  $on: Boolean!\n) {\n  projects: domainProjectsV2(scope: {domainName: $domainName}, limit: $limit) @include(if: $on) {\n    edges {\n      node {\n        entityId\n        id\n      }\n    }\n  }\n  users: domainUsersV2(scope: {domainName: $domainName}, limit: $limit) @include(if: $on) {\n    edges {\n      node {\n        entityId\n        id\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "6523c1bfa517240fb394aeb7bc70e4c7";

export default node;

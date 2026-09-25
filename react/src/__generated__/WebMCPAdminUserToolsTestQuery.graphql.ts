/**
 * @generated SignedSource<<1ec8921aae89c27fbaf63b7cd3f5f8f0>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type WebMCPAdminUserToolsTestQuery$variables = Record<PropertyKey, never>;
export type WebMCPAdminUserToolsTestQuery$data = {
  readonly adminUsersV2: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly " $fragmentSpreads": FragmentRefs<"WebMCPAdminUserToolsFragment">;
      };
    }>;
  } | null | undefined;
};
export type WebMCPAdminUserToolsTestQuery = {
  response: WebMCPAdminUserToolsTestQuery$data;
  variables: WebMCPAdminUserToolsTestQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "limit",
    "value": 10
  }
],
v1 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "String"
},
v2 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "String"
},
v3 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "DateTime"
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "WebMCPAdminUserToolsTestQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": "UserV2Connection",
        "kind": "LinkedField",
        "name": "adminUsersV2",
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
                "selections": [
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "WebMCPAdminUserToolsFragment"
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": "adminUsersV2(limit:10)"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "WebMCPAdminUserToolsTestQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": "UserV2Connection",
        "kind": "LinkedField",
        "name": "adminUsersV2",
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
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "id",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "UserV2BasicInfo",
                    "kind": "LinkedField",
                    "name": "basicInfo",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "email",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "fullName",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "username",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "UserV2OrganizationInfo",
                    "kind": "LinkedField",
                    "name": "organization",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "domainName",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "role",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "resourcePolicy",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "mainAccessKey",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "UserV2StatusInfo",
                    "kind": "LinkedField",
                    "name": "status",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "status",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "statusInfo",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "EntityTimestamps",
                    "kind": "LinkedField",
                    "name": "timestamps",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "createdAt",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "modifiedAt",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": "adminUsersV2(limit:10)"
      }
    ]
  },
  "params": {
    "cacheID": "a6688215dcb32136ea578ad22b411666",
    "id": null,
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "adminUsersV2": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "UserV2Connection"
        },
        "adminUsersV2.edges": {
          "enumValues": null,
          "nullable": false,
          "plural": true,
          "type": "UserV2Edge"
        },
        "adminUsersV2.edges.node": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "UserV2"
        },
        "adminUsersV2.edges.node.basicInfo": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "UserV2BasicInfo"
        },
        "adminUsersV2.edges.node.basicInfo.email": (v1/*: any*/),
        "adminUsersV2.edges.node.basicInfo.fullName": (v2/*: any*/),
        "adminUsersV2.edges.node.basicInfo.username": (v2/*: any*/),
        "adminUsersV2.edges.node.id": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ID"
        },
        "adminUsersV2.edges.node.organization": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "UserV2OrganizationInfo"
        },
        "adminUsersV2.edges.node.organization.domainName": (v2/*: any*/),
        "adminUsersV2.edges.node.organization.mainAccessKey": (v2/*: any*/),
        "adminUsersV2.edges.node.organization.resourcePolicy": (v1/*: any*/),
        "adminUsersV2.edges.node.organization.role": {
          "enumValues": [
            "USER",
            "ADMIN",
            "SUPERADMIN",
            "MONITOR"
          ],
          "nullable": true,
          "plural": false,
          "type": "UserRoleV2"
        },
        "adminUsersV2.edges.node.status": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "UserV2StatusInfo"
        },
        "adminUsersV2.edges.node.status.status": {
          "enumValues": [
            "ACTIVE",
            "INACTIVE",
            "DELETED",
            "BEFORE_VERIFICATION"
          ],
          "nullable": false,
          "plural": false,
          "type": "UserStatusV2"
        },
        "adminUsersV2.edges.node.status.statusInfo": (v2/*: any*/),
        "adminUsersV2.edges.node.timestamps": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "EntityTimestamps"
        },
        "adminUsersV2.edges.node.timestamps.createdAt": (v3/*: any*/),
        "adminUsersV2.edges.node.timestamps.modifiedAt": (v3/*: any*/)
      }
    },
    "name": "WebMCPAdminUserToolsTestQuery",
    "operationKind": "query",
    "text": "query WebMCPAdminUserToolsTestQuery {\n  adminUsersV2(limit: 10) {\n    edges {\n      node {\n        ...WebMCPAdminUserToolsFragment\n        id\n      }\n    }\n  }\n}\n\nfragment WebMCPAdminUserToolsFragment on UserV2 {\n  id\n  basicInfo {\n    email\n    fullName\n    username\n  }\n  organization {\n    domainName\n    role\n    resourcePolicy\n    mainAccessKey\n  }\n  status {\n    status\n    statusInfo\n  }\n  timestamps {\n    createdAt\n    modifiedAt\n  }\n}\n"
  }
};
})();

(node as any).hash = "2eacba90ed57c7d05d162982d779701d";

export default node;

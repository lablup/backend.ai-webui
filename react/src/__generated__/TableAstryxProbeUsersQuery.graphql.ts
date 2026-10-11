/**
 * @generated SignedSource<<5e022b0fc67ea54dfa2a4f5aa8207e00>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type TableAstryxProbeUsersQuery$variables = {
  isNotSupportTotp: boolean;
};
export type TableAstryxProbeUsersQuery$data = {
  readonly adminUsersV2: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly " $fragmentSpreads": FragmentRefs<"BAIAdminUserV2TableFragment">;
      };
    }>;
  } | null | undefined;
};
export type TableAstryxProbeUsersQuery = {
  response: TableAstryxProbeUsersQuery$data;
  variables: TableAstryxProbeUsersQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "isNotSupportTotp"
  }
],
v1 = [
  {
    "kind": "Literal",
    "name": "limit",
    "value": 10
  },
  {
    "kind": "Literal",
    "name": "offset",
    "value": 0
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "TableAstryxProbeUsersQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
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
                    "name": "BAIAdminUserV2TableFragment"
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": "adminUsersV2(limit:10,offset:0)"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "TableAstryxProbeUsersQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
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
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "description",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "integrationName",
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
                    "concreteType": "UserV2SecurityInfo",
                    "kind": "LinkedField",
                    "name": "security",
                    "plural": false,
                    "selections": [
                      {
                        "condition": "isNotSupportTotp",
                        "kind": "Condition",
                        "passingValue": false,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "totpActivated",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "totpActivatedAt",
                            "storageKey": null
                          }
                        ]
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "sudoSessionEnabled",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "allowedClientIp",
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
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "needPasswordChange",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "UserV2ContainerSettings",
                    "kind": "LinkedField",
                    "name": "container",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "containerUid",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "containerMainGid",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "containerGids",
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
        "storageKey": "adminUsersV2(limit:10,offset:0)"
      }
    ]
  },
  "params": {
    "cacheID": "3c745c3e714a361c41757e2a11e52e1c",
    "id": null,
    "metadata": {},
    "name": "TableAstryxProbeUsersQuery",
    "operationKind": "query",
    "text": "query TableAstryxProbeUsersQuery(\n  $isNotSupportTotp: Boolean!\n) {\n  adminUsersV2(limit: 10, offset: 0) {\n    edges {\n      node {\n        ...BAIAdminUserV2TableFragment\n        id\n      }\n    }\n  }\n}\n\nfragment BAIAdminUserV2TableFragment on UserV2 {\n  id\n  basicInfo {\n    email\n    fullName\n    username\n    description\n    integrationName\n  }\n  organization {\n    domainName\n    role\n    resourcePolicy\n    mainAccessKey\n  }\n  security {\n    totpActivated @skip(if: $isNotSupportTotp) @skipOnClient(if: $isNotSupportTotp)\n    totpActivatedAt @skip(if: $isNotSupportTotp) @skipOnClient(if: $isNotSupportTotp)\n    sudoSessionEnabled\n    allowedClientIp\n  }\n  status {\n    status\n    statusInfo\n    needPasswordChange\n  }\n  container {\n    containerUid\n    containerMainGid\n    containerGids\n  }\n  timestamps {\n    createdAt\n    modifiedAt\n  }\n}\n"
  }
};
})();

(node as any).hash = "c74c45a5ae2828dfac5123ab2f5d7ffd";

export default node;

/**
 * @generated SignedSource<<d72ad0d7b8a0eb64cc7b8a3ea80ebe7a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type RBACElementType = "AGENT" | "APP_CONFIG" | "ARTIFACT" | "ARTIFACT_REGISTRY" | "ARTIFACT_REVISION" | "AUDIT_LOG" | "CONTAINER_REGISTRY" | "DEPLOYMENT_POLICY" | "DEPLOYMENT_REVISION" | "DEPLOYMENT_TOKEN" | "DOMAIN" | "DOMAIN_ADMIN_PAGE" | "EVENT_LOG" | "IMAGE" | "IMAGE_ALIAS" | "KERNEL" | "KEYPAIR" | "KEYPAIR_RESOURCE_POLICY" | "MODEL_CARD" | "MODEL_DEPLOYMENT" | "NETWORK" | "NOTIFICATION_CHANNEL" | "NOTIFICATION_RULE" | "PROJECT" | "PROJECT_ADMIN_PAGE" | "PROJECT_RESOURCE_POLICY" | "RESOURCE_GROUP" | "RESOURCE_PRESET" | "ROLE" | "ROLE_ASSIGNMENT" | "ROUTING" | "SESSION" | "SESSION_APP_SERVICE" | "SESSION_TEMPLATE" | "STORAGE_HOST" | "USER" | "USER_EMAIL" | "USER_RESOURCE_POLICY" | "VFOLDER" | "VFOLDER_DATA" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type RoleScopeTabFragment$data = {
  readonly adminRole: {
    readonly paginatedScopes: {
      readonly count: number;
      readonly edges: ReadonlyArray<{
        readonly node: {
          readonly scope: {
            readonly basicInfo?: {
              readonly domainName?: string;
              readonly projectName: string;
              readonly userEmail?: string;
            };
          } | null | undefined;
          readonly scopeId: string;
          readonly scopeType: RBACElementType;
        };
      }>;
    } | null | undefined;
  } | null | undefined;
  readonly " $fragmentType": "RoleScopeTabFragment";
};
export type RoleScopeTabFragment$key = {
  readonly " $data"?: RoleScopeTabFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"RoleScopeTabFragment">;
};

import RoleScopeTabRefetchQuery_graphql from './RoleScopeTabRefetchQuery.graphql';

const node: ReaderFragment = {
  "argumentDefinitions": [
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "filter"
    },
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "limit"
    },
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "offset"
    },
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "orderBy"
    },
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "roleId"
    }
  ],
  "kind": "Fragment",
  "metadata": {
    "refetch": {
      "connection": null,
      "fragmentPathInResult": [],
      "operation": RoleScopeTabRefetchQuery_graphql
    }
  },
  "name": "RoleScopeTabFragment",
  "selections": [
    {
      "alias": null,
      "args": [
        {
          "kind": "Variable",
          "name": "id",
          "variableName": "roleId"
        }
      ],
      "concreteType": "Role",
      "kind": "LinkedField",
      "name": "adminRole",
      "plural": false,
      "selections": [
        {
          "alias": "paginatedScopes",
          "args": [
            {
              "kind": "Variable",
              "name": "filter",
              "variableName": "filter"
            },
            {
              "kind": "Variable",
              "name": "limit",
              "variableName": "limit"
            },
            {
              "kind": "Variable",
              "name": "offset",
              "variableName": "offset"
            },
            {
              "kind": "Variable",
              "name": "orderBy",
              "variableName": "orderBy"
            }
          ],
          "concreteType": "EntityConnection",
          "kind": "LinkedField",
          "name": "scopes",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "count",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "concreteType": "EntityRefEdge",
              "kind": "LinkedField",
              "name": "edges",
              "plural": true,
              "selections": [
                {
                  "alias": null,
                  "args": null,
                  "concreteType": "EntityRef",
                  "kind": "LinkedField",
                  "name": "node",
                  "plural": false,
                  "selections": [
                    {
                      "alias": null,
                      "args": null,
                      "kind": "ScalarField",
                      "name": "scopeType",
                      "storageKey": null
                    },
                    {
                      "alias": null,
                      "args": null,
                      "kind": "ScalarField",
                      "name": "scopeId",
                      "storageKey": null
                    },
                    {
                      "alias": null,
                      "args": null,
                      "concreteType": null,
                      "kind": "LinkedField",
                      "name": "scope",
                      "plural": false,
                      "selections": [
                        {
                          "kind": "InlineFragment",
                          "selections": [
                            {
                              "alias": null,
                              "args": null,
                              "concreteType": "ProjectBasicInfo",
                              "kind": "LinkedField",
                              "name": "basicInfo",
                              "plural": false,
                              "selections": [
                                {
                                  "alias": "projectName",
                                  "args": null,
                                  "kind": "ScalarField",
                                  "name": "name",
                                  "storageKey": null
                                }
                              ],
                              "storageKey": null
                            }
                          ],
                          "type": "ProjectV2",
                          "abstractKey": null
                        },
                        {
                          "kind": "InlineFragment",
                          "selections": [
                            {
                              "alias": null,
                              "args": null,
                              "concreteType": "DomainBasicInfo",
                              "kind": "LinkedField",
                              "name": "basicInfo",
                              "plural": false,
                              "selections": [
                                {
                                  "alias": "domainName",
                                  "args": null,
                                  "kind": "ScalarField",
                                  "name": "name",
                                  "storageKey": null
                                }
                              ],
                              "storageKey": null
                            }
                          ],
                          "type": "DomainV2",
                          "abstractKey": null
                        },
                        {
                          "kind": "InlineFragment",
                          "selections": [
                            {
                              "alias": null,
                              "args": null,
                              "concreteType": "UserV2BasicInfo",
                              "kind": "LinkedField",
                              "name": "basicInfo",
                              "plural": false,
                              "selections": [
                                {
                                  "alias": "userEmail",
                                  "args": null,
                                  "kind": "ScalarField",
                                  "name": "email",
                                  "storageKey": null
                                }
                              ],
                              "storageKey": null
                            }
                          ],
                          "type": "UserV2",
                          "abstractKey": null
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
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Query",
  "abstractKey": null
};

(node as any).hash = "0c689c9a4e07bf07266db83c194c85ae";

export default node;

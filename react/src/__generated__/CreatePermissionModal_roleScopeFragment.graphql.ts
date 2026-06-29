/**
 * @generated SignedSource<<cab3148cb9d13d02ae75839e10714dfe>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type RBACElementType = "AGENT" | "APP_CONFIG" | "APP_CONFIG_ALLOW_LIST" | "APP_CONFIG_DEFINITION" | "APP_CONFIG_FRAGMENT" | "ARTIFACT" | "ARTIFACT_REGISTRY" | "ARTIFACT_REVISION" | "AUDIT_LOG" | "CONTAINER_REGISTRY" | "DEPLOYMENT_POLICY" | "DEPLOYMENT_REVISION" | "DEPLOYMENT_TOKEN" | "DOMAIN" | "DOMAIN_ADMIN_PAGE" | "EVENT_LOG" | "IMAGE" | "IMAGE_ALIAS" | "KERNEL" | "KEYPAIR" | "KEYPAIR_RESOURCE_POLICY" | "MODEL_CARD" | "MODEL_DEPLOYMENT" | "NETWORK" | "NOTIFICATION_CHANNEL" | "NOTIFICATION_RULE" | "PROJECT" | "PROJECT_ADMIN_PAGE" | "PROJECT_RESOURCE_POLICY" | "RESOURCE_GROUP" | "RESOURCE_PRESET" | "ROLE" | "ROLE_ASSIGNMENT" | "ROUTING" | "SESSION" | "SESSION_APP_SERVICE" | "SESSION_TEMPLATE" | "STORAGE_HOST" | "USER" | "USER_EMAIL" | "USER_RESOURCE_POLICY" | "VFOLDER" | "VFOLDER_DATA" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type CreatePermissionModal_roleScopeFragment$data = {
  readonly allScopes: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly scope: {
          readonly basicInfo?: {
            readonly domainName: string;
            readonly email?: string;
            readonly projectName?: string;
          };
          readonly metadata?: {
            readonly deploymentName?: string;
            readonly sessionName: string;
          };
          readonly project?: string | null | undefined;
          readonly registryName?: string;
          readonly resourceGroupName?: string;
          readonly vfolderName?: string | null | undefined;
        } | null | undefined;
        readonly scopeId: string;
        readonly scopeType: RBACElementType;
      };
    }>;
  } | null | undefined;
  readonly " $fragmentType": "CreatePermissionModal_roleScopeFragment";
};
export type CreatePermissionModal_roleScopeFragment$key = {
  readonly " $data"?: CreatePermissionModal_roleScopeFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"CreatePermissionModal_roleScopeFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "CreatePermissionModal_roleScopeFragment",
  "selections": [
    {
      "alias": "allScopes",
      "args": [
        {
          "kind": "Literal",
          "name": "first",
          "value": 100
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
                            }
                          ],
                          "storageKey": null
                        }
                      ],
                      "type": "UserV2",
                      "abstractKey": null
                    },
                    {
                      "kind": "InlineFragment",
                      "selections": [
                        {
                          "alias": "vfolderName",
                          "args": null,
                          "kind": "ScalarField",
                          "name": "name",
                          "storageKey": null
                        }
                      ],
                      "type": "VirtualFolderNode",
                      "abstractKey": null
                    },
                    {
                      "kind": "InlineFragment",
                      "selections": [
                        {
                          "alias": null,
                          "args": null,
                          "concreteType": "SessionV2MetadataInfo",
                          "kind": "LinkedField",
                          "name": "metadata",
                          "plural": false,
                          "selections": [
                            {
                              "alias": "sessionName",
                              "args": null,
                              "kind": "ScalarField",
                              "name": "name",
                              "storageKey": null
                            }
                          ],
                          "storageKey": null
                        }
                      ],
                      "type": "SessionV2",
                      "abstractKey": null
                    },
                    {
                      "kind": "InlineFragment",
                      "selections": [
                        {
                          "alias": null,
                          "args": null,
                          "concreteType": "ModelDeploymentMetadata",
                          "kind": "LinkedField",
                          "name": "metadata",
                          "plural": false,
                          "selections": [
                            {
                              "alias": "deploymentName",
                              "args": null,
                              "kind": "ScalarField",
                              "name": "name",
                              "storageKey": null
                            }
                          ],
                          "storageKey": null
                        }
                      ],
                      "type": "ModelDeployment",
                      "abstractKey": null
                    },
                    {
                      "kind": "InlineFragment",
                      "selections": [
                        {
                          "alias": "resourceGroupName",
                          "args": null,
                          "kind": "ScalarField",
                          "name": "name",
                          "storageKey": null
                        }
                      ],
                      "type": "ResourceGroup",
                      "abstractKey": null
                    },
                    {
                      "kind": "InlineFragment",
                      "selections": [
                        {
                          "alias": null,
                          "args": null,
                          "kind": "ScalarField",
                          "name": "registryName",
                          "storageKey": null
                        },
                        {
                          "alias": null,
                          "args": null,
                          "kind": "ScalarField",
                          "name": "project",
                          "storageKey": null
                        }
                      ],
                      "type": "ContainerRegistryV2",
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
      "storageKey": "scopes(first:100)"
    }
  ],
  "type": "Role",
  "abstractKey": null
};

(node as any).hash = "7e675b44e51857c1815da18bcf154dab";

export default node;

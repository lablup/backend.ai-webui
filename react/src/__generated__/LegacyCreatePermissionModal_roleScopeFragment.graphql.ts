/**
 * @generated SignedSource<<7a6f16dbb519996e2df978bac18fa8c3>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type LegacyCreatePermissionModal_roleScopeFragment$data = {
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
            readonly sessionName?: string;
            readonly vfolderName: string;
          };
          readonly project?: string | null | undefined;
          readonly registryName?: string;
          readonly resourceGroupName?: string;
          readonly vfolderName?: string | null | undefined;
        } | null | undefined;
        readonly scopeId: string;
        readonly scopeType: string;
      };
    }>;
  } | null | undefined;
  readonly " $fragmentType": "LegacyCreatePermissionModal_roleScopeFragment";
};
export type LegacyCreatePermissionModal_roleScopeFragment$key = {
  readonly " $data"?: LegacyCreatePermissionModal_roleScopeFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"LegacyCreatePermissionModal_roleScopeFragment">;
};

const node: ReaderFragment = (function(){
var v0 = [
  {
    "alias": "vfolderName",
    "args": null,
    "kind": "ScalarField",
    "name": "name",
    "storageKey": null
  }
];
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "LegacyCreatePermissionModal_roleScopeFragment",
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
                      "selections": (v0/*: any*/),
                      "type": "VirtualFolderNode",
                      "abstractKey": null
                    },
                    {
                      "kind": "InlineFragment",
                      "selections": [
                        {
                          "kind": "InlineFragment",
                          "selections": [
                            {
                              "alias": null,
                              "args": null,
                              "concreteType": "VFolderMetadataInfo",
                              "kind": "LinkedField",
                              "name": "metadata",
                              "plural": false,
                              "selections": (v0/*: any*/),
                              "storageKey": null
                            }
                          ],
                          "type": "VFolder",
                          "abstractKey": null
                        }
                      ],
                      "type": "Node",
                      "abstractKey": "__isNode"
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
})();

(node as any).hash = "ce193adc0f9624ecf71ae4aaa686ca25";

export default node;

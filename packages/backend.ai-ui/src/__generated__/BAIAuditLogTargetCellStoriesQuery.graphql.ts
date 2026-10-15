/**
 * @generated SignedSource<<6025d81d59f23f93685a23124ec6e38c>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BAIAuditLogTargetCellStoriesQuery$variables = Record<PropertyKey, never>;
export type BAIAuditLogTargetCellStoriesQuery$data = {
  readonly adminAuditLogsV2: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly " $fragmentSpreads": FragmentRefs<"BAIAuditLogTargetCellFragment">;
      };
    }>;
  } | null | undefined;
};
export type BAIAuditLogTargetCellStoriesQuery = {
  response: BAIAuditLogTargetCellStoriesQuery$data;
  variables: BAIAuditLogTargetCellStoriesQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 1
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v2 = [
  (v1/*: any*/)
],
v3 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "configName",
    "storageKey": null
  }
],
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "concreteType": null,
  "kind": "LinkedField",
  "name": "entity",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "__typename",
      "storageKey": null
    },
    {
      "kind": "TypeDiscriminator",
      "abstractKey": "__isEntityNode"
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
          "alias": null,
          "args": null,
          "concreteType": "ProjectBasicInfo",
          "kind": "LinkedField",
          "name": "basicInfo",
          "plural": false,
          "selections": (v2/*: any*/),
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
          "selections": (v2/*: any*/),
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
          "concreteType": "ImageV2IdentityInfo",
          "kind": "LinkedField",
          "name": "identity",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "canonicalName",
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ],
      "type": "ImageV2",
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
          "selections": (v2/*: any*/),
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
          "selections": (v2/*: any*/),
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
          "alias": null,
          "args": null,
          "concreteType": "VFolderMetadataInfo",
          "kind": "LinkedField",
          "name": "metadata",
          "plural": false,
          "selections": (v2/*: any*/),
          "storageKey": null
        }
      ],
      "type": "VFolder",
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
          "alias": "sessionName",
          "args": null,
          "kind": "ScalarField",
          "name": "name",
          "storageKey": null
        }
      ],
      "type": "ComputeSessionNode",
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
        }
      ],
      "type": "ContainerRegistryV2",
      "abstractKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": (v3/*: any*/),
      "type": "AppConfigAllowList",
      "abstractKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": (v3/*: any*/),
      "type": "AppConfigDefinition",
      "abstractKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": (v3/*: any*/),
      "type": "AppConfigFragment",
      "abstractKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "namespace",
          "storageKey": null
        }
      ],
      "type": "StorageNamespace",
      "abstractKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": (v2/*: any*/),
      "type": "Artifact",
      "abstractKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": [
        (v1/*: any*/),
        (v4/*: any*/)
      ],
      "type": "ArtifactRegistry",
      "abstractKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": (v2/*: any*/),
      "type": "NotificationChannel",
      "abstractKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": (v2/*: any*/),
      "type": "NotificationRule",
      "abstractKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": (v2/*: any*/),
      "type": "ResourceGroup",
      "abstractKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": (v2/*: any*/),
      "type": "Role",
      "abstractKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": (v2/*: any*/),
      "type": "IdleChecker",
      "abstractKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": (v2/*: any*/),
      "type": "ObjectStorage",
      "abstractKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": (v2/*: any*/),
      "type": "RuntimeVariant",
      "abstractKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": (v2/*: any*/),
      "type": "RuntimeVariantPreset",
      "abstractKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": (v2/*: any*/),
      "type": "VFSStorage",
      "abstractKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": [
        (v4/*: any*/)
      ],
      "type": "Node",
      "abstractKey": "__isNode"
    }
  ],
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "BAIAuditLogTargetCellStoriesQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": "AuditLogV2Connection",
        "kind": "LinkedField",
        "name": "adminAuditLogsV2",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "AuditLogV2Edge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "AuditLogV2",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "BAIAuditLogTargetCellFragment"
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": "adminAuditLogsV2(first:1)"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "BAIAuditLogTargetCellStoriesQuery",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": "AuditLogV2Connection",
        "kind": "LinkedField",
        "name": "adminAuditLogsV2",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "AuditLogV2Edge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "AuditLogV2",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "actionId",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "actionKind",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "entityType",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "entityId",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "targetEntityId",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "lookupKind",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "lookupKey",
                    "storageKey": null
                  },
                  (v5/*: any*/),
                  {
                    "alias": null,
                    "args": [
                      {
                        "kind": "Literal",
                        "name": "first",
                        "value": 3
                      },
                      {
                        "kind": "Literal",
                        "name": "orderBy",
                        "value": [
                          {
                            "direction": "ASC",
                            "field": "SCOPE_TYPE"
                          },
                          {
                            "direction": "ASC",
                            "field": "SCOPE_ID"
                          }
                        ]
                      }
                    ],
                    "concreteType": "AuditLogScopeEntryConnection",
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
                        "concreteType": "AuditLogScopeEntryEdge",
                        "kind": "LinkedField",
                        "name": "edges",
                        "plural": true,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "AuditLogScopeEntry",
                            "kind": "LinkedField",
                            "name": "node",
                            "plural": false,
                            "selections": [
                              (v4/*: any*/),
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
                              (v5/*: any*/)
                            ],
                            "storageKey": null
                          }
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": "scopes(first:3,orderBy:[{\"direction\":\"ASC\",\"field\":\"SCOPE_TYPE\"},{\"direction\":\"ASC\",\"field\":\"SCOPE_ID\"}])"
                  },
                  (v4/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": "adminAuditLogsV2(first:1)"
      }
    ]
  },
  "params": {
    "cacheID": "007158dbf087ede0623383b8c59c3f65",
    "id": null,
    "metadata": {},
    "name": "BAIAuditLogTargetCellStoriesQuery",
    "operationKind": "query",
    "text": "query BAIAuditLogTargetCellStoriesQuery {\n  adminAuditLogsV2(first: 1) {\n    edges {\n      node {\n        ...BAIAuditLogTargetCellFragment\n        id\n      }\n    }\n  }\n}\n\nfragment BAIAuditLogTargetCellEntityFragment on EntityNode {\n  __isEntityNode: __typename\n  __typename\n  ... on UserV2 {\n    basicInfo {\n      email\n    }\n  }\n  ... on ProjectV2 {\n    basicInfo {\n      name\n    }\n  }\n  ... on DomainV2 {\n    basicInfo {\n      name\n    }\n  }\n  ... on ImageV2 {\n    identity {\n      canonicalName\n    }\n  }\n  ... on SessionV2 {\n    metadata {\n      name\n    }\n  }\n  ... on ModelDeployment {\n    metadata {\n      name\n    }\n  }\n  ... on VFolder {\n    metadata {\n      name\n    }\n  }\n  ... on VirtualFolderNode {\n    vfolderName: name\n  }\n  ... on ComputeSessionNode {\n    sessionName: name\n  }\n  ... on ContainerRegistryV2 {\n    registryName\n  }\n  ... on AppConfigAllowList {\n    configName\n  }\n  ... on AppConfigDefinition {\n    configName\n  }\n  ... on AppConfigFragment {\n    configName\n  }\n  ... on StorageNamespace {\n    namespace\n  }\n  ... on Artifact {\n    name\n  }\n  ... on ArtifactRegistry {\n    name\n  }\n  ... on NotificationChannel {\n    name\n  }\n  ... on NotificationRule {\n    name\n  }\n  ... on ResourceGroup {\n    name\n  }\n  ... on Role {\n    name\n  }\n  ... on IdleChecker {\n    name\n  }\n  ... on ObjectStorage {\n    name\n  }\n  ... on RuntimeVariant {\n    name\n  }\n  ... on RuntimeVariantPreset {\n    name\n  }\n  ... on VFSStorage {\n    name\n  }\n}\n\nfragment BAIAuditLogTargetCellFragment on AuditLogV2 {\n  actionId\n  actionKind\n  entityType\n  entityId\n  targetEntityId\n  lookupKind\n  lookupKey\n  entity {\n    __typename\n    ...BAIAuditLogTargetCellEntityFragment\n    ... on Node {\n      __isNode: __typename\n      id\n    }\n    ... on ArtifactRegistry {\n      id\n    }\n  }\n  scopes(first: 3, orderBy: [{field: SCOPE_TYPE, direction: ASC}, {field: SCOPE_ID, direction: ASC}]) {\n    count\n    edges {\n      node {\n        id\n        scopeType\n        scopeId\n        entity {\n          __typename\n          ...BAIAuditLogTargetCellEntityFragment\n          ... on Node {\n            __isNode: __typename\n            id\n          }\n          ... on ArtifactRegistry {\n            id\n          }\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "a803bde9a5650379b39a061cac81e0aa";

export default node;

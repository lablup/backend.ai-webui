/**
 * @generated SignedSource<<8aa071824422f7ab594cb8ab4dd162c3>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type RoleDetailDrawerV2RefetchQuery$variables = {
  id: string;
};
export type RoleDetailDrawerV2RefetchQuery$data = {
  readonly node: {
    readonly " $fragmentSpreads": FragmentRefs<"RoleDetailDrawerV2Fragment">;
  } | null | undefined;
};
export type RoleDetailDrawerV2RefetchQuery = {
  response: RoleDetailDrawerV2RefetchQuery$data;
  variables: RoleDetailDrawerV2RefetchQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v5 = [
  (v4/*: any*/)
],
v6 = [
  (v3/*: any*/)
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RoleDetailDrawerV2RefetchQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "RoleDetailDrawerV2Fragment"
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RoleDetailDrawerV2RefetchQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "source",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "entityId",
                "storageKey": null
              },
              (v4/*: any*/),
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
                "name": "status",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "autoAssign",
                "storageKey": null
              },
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
                "name": "updatedAt",
                "storageKey": null
              },
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
                  (v2/*: any*/),
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
                        "selections": (v5/*: any*/),
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
                        "selections": (v5/*: any*/),
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
                        "alias": null,
                        "args": null,
                        "concreteType": "VFolderMetadataInfo",
                        "kind": "LinkedField",
                        "name": "metadata",
                        "plural": false,
                        "selections": (v5/*: any*/),
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
                        "selections": (v5/*: any*/),
                        "storageKey": null
                      }
                    ],
                    "type": "ModelDeployment",
                    "abstractKey": null
                  },
                  {
                    "kind": "InlineFragment",
                    "selections": (v5/*: any*/),
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
                  },
                  {
                    "kind": "InlineFragment",
                    "selections": (v6/*: any*/),
                    "type": "Node",
                    "abstractKey": "__isNode"
                  },
                  {
                    "kind": "InlineFragment",
                    "selections": (v6/*: any*/),
                    "type": "ArtifactRegistry",
                    "abstractKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "rolePresetId",
                "storageKey": null
              }
            ],
            "type": "Role",
            "abstractKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "1e0b62ce55795b8adc4bd09e0ca9d4af",
    "id": null,
    "metadata": {},
    "name": "RoleDetailDrawerV2RefetchQuery",
    "operationKind": "query",
    "text": "query RoleDetailDrawerV2RefetchQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...RoleDetailDrawerV2Fragment\n    id\n  }\n}\n\nfragment RoleAssignmentTabFragment on Role {\n  id\n  entityId\n  name\n  source\n  scopeType\n  scopeId\n}\n\nfragment RoleDetailDrawerContentV2Fragment on Role {\n  id\n  entityId\n  name\n  description\n  source\n  status\n  autoAssign\n  createdAt\n  updatedAt\n  scopeType\n  scopeId\n  scope {\n    __typename\n    ... on DomainV2 {\n      basicInfo {\n        name\n      }\n    }\n    ... on ProjectV2 {\n      basicInfo {\n        name\n      }\n    }\n    ... on UserV2 {\n      basicInfo {\n        email\n      }\n    }\n    ... on VFolder {\n      metadata {\n        name\n      }\n    }\n    ... on SessionV2 {\n      metadata {\n        sessionName: name\n      }\n    }\n    ... on ModelDeployment {\n      metadata {\n        name\n      }\n    }\n    ... on ResourceGroup {\n      name\n    }\n    ... on ContainerRegistryV2 {\n      registryName\n      project\n    }\n    ... on Node {\n      __isNode: __typename\n      id\n    }\n    ... on ArtifactRegistry {\n      id\n    }\n  }\n  rolePresetId\n  ...RoleAssignmentTabFragment\n  ...RolePermissionSummaryTableFragment\n}\n\nfragment RoleDetailDrawerV2Fragment on Role {\n  source\n  ...RoleDetailDrawerContentV2Fragment\n  ...RoleFormModalFragment\n  id\n}\n\nfragment RoleFormModalFragment on Role {\n  id\n  entityId\n  name\n  description\n  autoAssign\n}\n\nfragment RolePermissionSummaryTableFragment on Role {\n  id\n  entityId\n  source\n  scopeType\n}\n"
  }
};
})();

(node as any).hash = "b9a311b9ce7e1a05459123018d943717";

export default node;

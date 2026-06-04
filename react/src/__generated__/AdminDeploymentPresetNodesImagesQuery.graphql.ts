/**
 * @generated SignedSource<<e2ff48d7aabce8bc1ee37803bd11ae6a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type ImageV2Status = "ALIVE" | "DELETED" | "%future added value";
export type ImageV2Filter = {
  AND?: ReadonlyArray<ImageV2Filter> | null | undefined;
  NOT?: ReadonlyArray<ImageV2Filter> | null | undefined;
  OR?: ReadonlyArray<ImageV2Filter> | null | undefined;
  alias?: ImageAliasNestedFilter | null | undefined;
  architecture?: StringFilter | null | undefined;
  id?: UUIDFilter | null | undefined;
  lastUsed?: DateTimeFilter | null | undefined;
  name?: StringFilter | null | undefined;
  registryId?: UUIDFilter | null | undefined;
  status?: ImageV2StatusFilter | null | undefined;
};
export type ImageV2StatusFilter = {
  equals?: ImageV2Status | null | undefined;
  in?: ReadonlyArray<ImageV2Status> | null | undefined;
  notEquals?: ImageV2Status | null | undefined;
  notIn?: ReadonlyArray<ImageV2Status> | null | undefined;
};
export type StringFilter = {
  contains?: string | null | undefined;
  endsWith?: string | null | undefined;
  equals?: string | null | undefined;
  iContains?: string | null | undefined;
  iEndsWith?: string | null | undefined;
  iEquals?: string | null | undefined;
  iIn?: ReadonlyArray<string> | null | undefined;
  iNotContains?: string | null | undefined;
  iNotEndsWith?: string | null | undefined;
  iNotEquals?: string | null | undefined;
  iNotIn?: ReadonlyArray<string> | null | undefined;
  iNotStartsWith?: string | null | undefined;
  iStartsWith?: string | null | undefined;
  in?: ReadonlyArray<string> | null | undefined;
  notContains?: string | null | undefined;
  notEndsWith?: string | null | undefined;
  notEquals?: string | null | undefined;
  notIn?: ReadonlyArray<string> | null | undefined;
  notStartsWith?: string | null | undefined;
  startsWith?: string | null | undefined;
};
export type UUIDFilter = {
  equals?: string | null | undefined;
  in?: ReadonlyArray<string> | null | undefined;
  notEquals?: string | null | undefined;
  notIn?: ReadonlyArray<string> | null | undefined;
};
export type ImageAliasNestedFilter = {
  alias?: StringFilter | null | undefined;
};
export type DateTimeFilter = {
  after?: string | null | undefined;
  before?: string | null | undefined;
  equals?: string | null | undefined;
  notEquals?: string | null | undefined;
};
export type AdminDeploymentPresetNodesImagesQuery$variables = {
  filter?: ImageV2Filter | null | undefined;
  limit: number;
};
export type AdminDeploymentPresetNodesImagesQuery$data = {
  readonly adminImagesV2: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly identity: {
          readonly canonicalName: string;
        };
      };
    }>;
  } | null | undefined;
};
export type AdminDeploymentPresetNodesImagesQuery = {
  response: AdminDeploymentPresetNodesImagesQuery$data;
  variables: AdminDeploymentPresetNodesImagesQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "filter"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "limit"
  }
],
v1 = [
  {
    "alias": null,
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
      }
    ],
    "concreteType": "ImageV2Connection",
    "kind": "LinkedField",
    "name": "adminImagesV2",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "ImageV2Edge",
        "kind": "LinkedField",
        "name": "edges",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "ImageV2",
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
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "AdminDeploymentPresetNodesImagesQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "AdminDeploymentPresetNodesImagesQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "c77c08189254ccb1a2968afb6fa38fb4",
    "id": null,
    "metadata": {},
    "name": "AdminDeploymentPresetNodesImagesQuery",
    "operationKind": "query",
    "text": "query AdminDeploymentPresetNodesImagesQuery(\n  $filter: ImageV2Filter\n  $limit: Int!\n) {\n  adminImagesV2(filter: $filter, limit: $limit) {\n    edges {\n      node {\n        id\n        identity {\n          canonicalName\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "4fd4edab5c822583666a2b58b5b7c498";

export default node;

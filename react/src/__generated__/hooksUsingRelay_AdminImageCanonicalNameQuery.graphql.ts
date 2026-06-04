/**
 * @generated SignedSource<<71208193add74880b6350fb25397d506>>
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
export type hooksUsingRelay_AdminImageCanonicalNameQuery$variables = {
  filter?: ImageV2Filter | null | undefined;
};
export type hooksUsingRelay_AdminImageCanonicalNameQuery$data = {
  readonly adminImagesV2: {
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly identity: {
          readonly canonicalName: string;
        };
      };
    }>;
  } | null | undefined;
};
export type hooksUsingRelay_AdminImageCanonicalNameQuery = {
  response: hooksUsingRelay_AdminImageCanonicalNameQuery$data;
  variables: hooksUsingRelay_AdminImageCanonicalNameQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "filter"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "filter",
    "variableName": "filter"
  },
  {
    "kind": "Literal",
    "name": "limit",
    "value": 1
  }
],
v2 = {
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
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "hooksUsingRelay_AdminImageCanonicalNameQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
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
                  (v2/*: any*/)
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
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "hooksUsingRelay_AdminImageCanonicalNameQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
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
                  (v2/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "id",
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
    ]
  },
  "params": {
    "cacheID": "5f76621633d3fbb3a5b27f16fc71407d",
    "id": null,
    "metadata": {},
    "name": "hooksUsingRelay_AdminImageCanonicalNameQuery",
    "operationKind": "query",
    "text": "query hooksUsingRelay_AdminImageCanonicalNameQuery(\n  $filter: ImageV2Filter\n) {\n  adminImagesV2(filter: $filter, limit: 1) {\n    edges {\n      node {\n        identity {\n          canonicalName\n        }\n        id\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "bc9f759856442c3e8ff0480c1823529f";

export default node;

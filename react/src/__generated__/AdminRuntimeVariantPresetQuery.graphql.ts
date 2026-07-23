/**
 * @generated SignedSource<<c45a6a4754d0a9f1bf2a56df452a4454>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type RuntimeVariantPresetOrderField = "CREATED_AT" | "NAME" | "RANK" | "%future added value";
export type RuntimeVariantPresetFilter = {
  AND?: ReadonlyArray<RuntimeVariantPresetFilter> | null | undefined;
  NOT?: ReadonlyArray<RuntimeVariantPresetFilter> | null | undefined;
  OR?: ReadonlyArray<RuntimeVariantPresetFilter> | null | undefined;
  name?: StringFilter | null | undefined;
  runtimeVariantId?: UUIDFilter | null | undefined;
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
export type RuntimeVariantPresetOrderBy = {
  direction?: string;
  field: RuntimeVariantPresetOrderField;
};
export type AdminRuntimeVariantPresetQuery$variables = {
  filter?: RuntimeVariantPresetFilter | null | undefined;
  limit?: number | null | undefined;
  offset?: number | null | undefined;
  orderBy?: ReadonlyArray<RuntimeVariantPresetOrderBy> | null | undefined;
};
export type AdminRuntimeVariantPresetQuery$data = {
  readonly runtimeVariantPresets: {
    readonly count: number;
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly " $fragmentSpreads": FragmentRefs<"BAIRuntimeVariantPresetSettingModalFragment" | "BAIRuntimeVariantPresetTableFragment">;
      };
    }>;
  } | null | undefined;
};
export type AdminRuntimeVariantPresetQuery = {
  response: AdminRuntimeVariantPresetQuery$data;
  variables: AdminRuntimeVariantPresetQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "filter"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "limit"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "offset"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "orderBy"
},
v4 = [
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
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "count",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "AdminRuntimeVariantPresetQuery",
    "selections": [
      {
        "alias": null,
        "args": (v4/*: any*/),
        "concreteType": "RuntimeVariantPresetConnection",
        "kind": "LinkedField",
        "name": "runtimeVariantPresets",
        "plural": false,
        "selections": [
          (v5/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "RuntimeVariantPresetEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "RuntimeVariantPreset",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v6/*: any*/),
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "BAIRuntimeVariantPresetTableFragment"
                  },
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "BAIRuntimeVariantPresetSettingModalFragment"
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
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v3/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Operation",
    "name": "AdminRuntimeVariantPresetQuery",
    "selections": [
      {
        "alias": null,
        "args": (v4/*: any*/),
        "concreteType": "RuntimeVariantPresetConnection",
        "kind": "LinkedField",
        "name": "runtimeVariantPresets",
        "plural": false,
        "selections": [
          (v5/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "RuntimeVariantPresetEdge",
            "kind": "LinkedField",
            "name": "edges",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "RuntimeVariantPreset",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  (v6/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "runtimeVariantId",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "RuntimeVariant",
                    "kind": "LinkedField",
                    "name": "runtimeVariant",
                    "plural": false,
                    "selections": [
                      (v7/*: any*/),
                      (v6/*: any*/)
                    ],
                    "storageKey": null
                  },
                  (v7/*: any*/),
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
                    "name": "rank",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "PresetTargetSpec",
                    "kind": "LinkedField",
                    "name": "targetSpec",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "presetTarget",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "valueType",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "defaultValue",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "key",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "required",
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
    "cacheID": "ad337dc7d2db6d546a2fdb2a4585c1d0",
    "id": null,
    "metadata": {},
    "name": "AdminRuntimeVariantPresetQuery",
    "operationKind": "query",
    "text": "query AdminRuntimeVariantPresetQuery(\n  $filter: RuntimeVariantPresetFilter\n  $orderBy: [RuntimeVariantPresetOrderBy!]\n  $limit: Int\n  $offset: Int\n) {\n  runtimeVariantPresets(filter: $filter, orderBy: $orderBy, limit: $limit, offset: $offset) {\n    count\n    edges {\n      node {\n        id\n        ...BAIRuntimeVariantPresetTableFragment\n        ...BAIRuntimeVariantPresetSettingModalFragment\n      }\n    }\n  }\n}\n\nfragment BAIRuntimeVariantPresetSettingModalFragment on RuntimeVariantPreset {\n  id\n  runtimeVariantId\n  name\n  description\n  rank\n  targetSpec {\n    presetTarget\n    valueType\n    defaultValue\n    key\n  }\n  required @since(version: \"26.4.4\")\n}\n\nfragment BAIRuntimeVariantPresetTableFragment on RuntimeVariantPreset {\n  id\n  runtimeVariantId\n  runtimeVariant @since(version: \"26.8.0\") {\n    name\n    id\n  }\n  name\n  description\n  rank\n  targetSpec {\n    presetTarget\n    valueType\n    defaultValue\n    key\n  }\n  required @since(version: \"26.4.4\")\n  createdAt\n  updatedAt\n}\n"
  }
};
})();

(node as any).hash = "0e8b4a450530419c80e8ab241723b8ec";

export default node;

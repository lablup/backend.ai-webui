/**
 * @generated SignedSource<<ef887233f31a4b824af5a87f0f88a4c4>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { Result } from "relay-runtime";
export type PresetTarget = "ARGS" | "ENV" | "%future added value";
export type PresetValueType = "BOOL" | "FLAG" | "FLOAT" | "INT" | "STR" | "%future added value";
export type RuntimeVariantPresetOrderField = "CREATED_AT" | "NAME" | "RANK" | "%future added value";
export type RuntimeVariantPresetFilter = {
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
export type useRuntimeParameterSchemaPresetsQuery$variables = {
  filter?: RuntimeVariantPresetFilter | null | undefined;
  orderBy?: ReadonlyArray<RuntimeVariantPresetOrderBy> | null | undefined;
};
export type useRuntimeParameterSchemaPresetsQuery$data = {
  readonly runtimeVariantPresetsResult: Result<{
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly category: string | null | undefined;
        readonly description: string | null | undefined;
        readonly displayName: string | null | undefined;
        readonly name: string;
        readonly rank: number;
        readonly targetSpec: {
          readonly defaultValue: string | null | undefined;
          readonly key: string;
          readonly presetTarget: PresetTarget;
          readonly valueType: PresetValueType;
        };
        readonly uiOption: {
          readonly choices: {
            readonly items: ReadonlyArray<{
              readonly label: string;
              readonly value: string;
            }>;
          } | null | undefined;
          readonly number: {
            readonly max: number | null | undefined;
            readonly min: number | null | undefined;
          } | null | undefined;
          readonly slider: {
            readonly max: number;
            readonly min: number;
            readonly step: number;
          } | null | undefined;
          readonly text: {
            readonly placeholder: string | null | undefined;
          } | null | undefined;
          readonly uiType: string;
        } | null | undefined;
      };
    }>;
  } | null | undefined, unknown>;
};
export type useRuntimeParameterSchemaPresetsQuery = {
  response: useRuntimeParameterSchemaPresetsQuery$data;
  variables: useRuntimeParameterSchemaPresetsQuery$variables;
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
    "name": "orderBy"
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
    "name": "first",
    "value": 100
  },
  {
    "kind": "Variable",
    "name": "orderBy",
    "variableName": "orderBy"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "description",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "rank",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "category",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "displayName",
  "storageKey": null
},
v7 = {
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
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "min",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "max",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "concreteType": "UIOption",
  "kind": "LinkedField",
  "name": "uiOption",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "uiType",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "SliderOption",
      "kind": "LinkedField",
      "name": "slider",
      "plural": false,
      "selections": [
        (v8/*: any*/),
        (v9/*: any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "step",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "NumberOption",
      "kind": "LinkedField",
      "name": "number",
      "plural": false,
      "selections": [
        (v8/*: any*/),
        (v9/*: any*/)
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "ChoiceOption",
      "kind": "LinkedField",
      "name": "choices",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "ChoiceItem",
          "kind": "LinkedField",
          "name": "items",
          "plural": true,
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "value",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "label",
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "TextOption",
      "kind": "LinkedField",
      "name": "text",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "placeholder",
          "storageKey": null
        }
      ],
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
    "name": "useRuntimeParameterSchemaPresetsQuery",
    "selections": [
      {
        "kind": "CatchField",
        "field": {
          "alias": "runtimeVariantPresetsResult",
          "args": (v1/*: any*/),
          "concreteType": "RuntimeVariantPresetConnection",
          "kind": "LinkedField",
          "name": "runtimeVariantPresets",
          "plural": false,
          "selections": [
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
                    (v2/*: any*/),
                    (v3/*: any*/),
                    (v4/*: any*/),
                    (v5/*: any*/),
                    (v6/*: any*/),
                    (v7/*: any*/),
                    (v10/*: any*/)
                  ],
                  "storageKey": null
                }
              ],
              "storageKey": null
            }
          ],
          "storageKey": null
        },
        "to": "RESULT"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "useRuntimeParameterSchemaPresetsQuery",
    "selections": [
      {
        "alias": "runtimeVariantPresetsResult",
        "args": (v1/*: any*/),
        "concreteType": "RuntimeVariantPresetConnection",
        "kind": "LinkedField",
        "name": "runtimeVariantPresets",
        "plural": false,
        "selections": [
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
                  (v2/*: any*/),
                  (v3/*: any*/),
                  (v4/*: any*/),
                  (v5/*: any*/),
                  (v6/*: any*/),
                  (v7/*: any*/),
                  (v10/*: any*/),
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
    "cacheID": "9ec67e7389f1f7cec0f197e6ff23ec91",
    "id": null,
    "metadata": {},
    "name": "useRuntimeParameterSchemaPresetsQuery",
    "operationKind": "query",
    "text": "query useRuntimeParameterSchemaPresetsQuery(\n  $filter: RuntimeVariantPresetFilter\n  $orderBy: [RuntimeVariantPresetOrderBy!]\n) {\n  runtimeVariantPresetsResult: runtimeVariantPresets(filter: $filter, orderBy: $orderBy, first: 100) {\n    edges {\n      node {\n        name\n        description\n        rank\n        category\n        displayName\n        targetSpec {\n          presetTarget\n          valueType\n          defaultValue\n          key\n        }\n        uiOption {\n          uiType\n          slider {\n            min\n            max\n            step\n          }\n          number {\n            min\n            max\n          }\n          choices {\n            items {\n              value\n              label\n            }\n          }\n          text {\n            placeholder\n          }\n        }\n        id\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "ca5ee1b8f0a7378db0a58b62f8709a68";

export default node;

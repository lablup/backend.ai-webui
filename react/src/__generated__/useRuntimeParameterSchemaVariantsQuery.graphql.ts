/**
 * @generated SignedSource<<5f18317b31f423d3077ab4400ed19dda>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { Result } from "relay-runtime";
export type RuntimeVariantFilter = {
  name?: StringFilter | null | undefined;
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
export type useRuntimeParameterSchemaVariantsQuery$variables = {
  filter?: RuntimeVariantFilter | null | undefined;
};
export type useRuntimeParameterSchemaVariantsQuery$data = {
  readonly runtimeVariantsResult: Result<{
    readonly edges: ReadonlyArray<{
      readonly node: {
        readonly id: string;
        readonly name: string;
      };
    }>;
  } | null | undefined, unknown>;
};
export type useRuntimeParameterSchemaVariantsQuery = {
  response: useRuntimeParameterSchemaVariantsQuery$data;
  variables: useRuntimeParameterSchemaVariantsQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "filter"
  }
],
v1 = {
  "alias": "runtimeVariantsResult",
  "args": [
    {
      "kind": "Variable",
      "name": "filter",
      "variableName": "filter"
    },
    {
      "kind": "Literal",
      "name": "first",
      "value": 1
    }
  ],
  "concreteType": "RuntimeVariantConnection",
  "kind": "LinkedField",
  "name": "runtimeVariants",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "RuntimeVariantEdge",
      "kind": "LinkedField",
      "name": "edges",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "RuntimeVariant",
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
              "kind": "ScalarField",
              "name": "name",
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
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "useRuntimeParameterSchemaVariantsQuery",
    "selections": [
      {
        "kind": "CatchField",
        "field": (v1/*: any*/),
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
    "name": "useRuntimeParameterSchemaVariantsQuery",
    "selections": [
      (v1/*: any*/)
    ]
  },
  "params": {
    "cacheID": "c682513f5e9e13cb4231c771873116d0",
    "id": null,
    "metadata": {},
    "name": "useRuntimeParameterSchemaVariantsQuery",
    "operationKind": "query",
    "text": "query useRuntimeParameterSchemaVariantsQuery(\n  $filter: RuntimeVariantFilter\n) {\n  runtimeVariantsResult: runtimeVariants(filter: $filter, first: 1) {\n    edges {\n      node {\n        id\n        name\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "4a430bb72586e76dae1f300fdd57f51a";

export default node;

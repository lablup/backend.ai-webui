/**
 * @generated SignedSource<<3f56789e1280421a0a9fe4243d0540e0>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type useAppConfigUserRawQuery$variables = {
  configNames: ReadonlyArray<string>;
  scopeId?: string | null | undefined;
};
export type useAppConfigUserRawQuery$data = {
  readonly scopedAppConfigFragmentsByNames: ReadonlyArray<{
    readonly config: any;
    readonly configName: string;
    readonly id: string;
  } | null | undefined>;
};
export type useAppConfigUserRawQuery = {
  response: useAppConfigUserRawQuery$data;
  variables: useAppConfigUserRawQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "configNames"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "scopeId"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "configNames",
        "variableName": "configNames"
      },
      {
        "fields": [
          {
            "kind": "Variable",
            "name": "scopeId",
            "variableName": "scopeId"
          },
          {
            "kind": "Literal",
            "name": "scopeType",
            "value": "USER"
          }
        ],
        "kind": "ObjectValue",
        "name": "scope"
      }
    ],
    "concreteType": "AppConfigFragment",
    "kind": "LinkedField",
    "name": "scopedAppConfigFragmentsByNames",
    "plural": true,
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
        "name": "configName",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "config",
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
    "name": "useAppConfigUserRawQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "useAppConfigUserRawQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "20e2d2aaacb573642adee91548ab392f",
    "id": null,
    "metadata": {},
    "name": "useAppConfigUserRawQuery",
    "operationKind": "query",
    "text": "query useAppConfigUserRawQuery(\n  $configNames: [String!]!\n  $scopeId: UUID\n) {\n  scopedAppConfigFragmentsByNames(scope: {scopeType: USER, scopeId: $scopeId}, configNames: $configNames) {\n    id\n    configName\n    config\n  }\n}\n"
  }
};
})();

(node as any).hash = "aeb233a3623cae47788f0ef5fe145677";

export default node;

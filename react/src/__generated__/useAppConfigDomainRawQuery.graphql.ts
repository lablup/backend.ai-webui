/**
 * @generated SignedSource<<09bf8a0f63ad5f2e17a0ffce88af9582>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type useAppConfigDomainRawQuery$variables = {
  configNames: ReadonlyArray<string>;
  scopeId: string;
};
export type useAppConfigDomainRawQuery$data = {
  readonly scopedAppConfigFragmentsByNames: ReadonlyArray<{
    readonly config: any;
    readonly configName: string;
    readonly id: string;
  } | null | undefined>;
};
export type useAppConfigDomainRawQuery = {
  response: useAppConfigDomainRawQuery$data;
  variables: useAppConfigDomainRawQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "configNames"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "scopeId"
},
v2 = [
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
            "value": "DOMAIN"
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
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "useAppConfigDomainRawQuery",
    "selections": (v2/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "useAppConfigDomainRawQuery",
    "selections": (v2/*: any*/)
  },
  "params": {
    "cacheID": "1d361fa75e2154bda74a382fd8621e51",
    "id": null,
    "metadata": {},
    "name": "useAppConfigDomainRawQuery",
    "operationKind": "query",
    "text": "query useAppConfigDomainRawQuery(\n  $scopeId: UUID!\n  $configNames: [String!]!\n) {\n  scopedAppConfigFragmentsByNames(scope: {scopeType: DOMAIN, scopeId: $scopeId}, configNames: $configNames) {\n    id\n    configName\n    config\n  }\n}\n"
  }
};
})();

(node as any).hash = "da4a8cf295f7377e3ce13a08a869b0f1";

export default node;

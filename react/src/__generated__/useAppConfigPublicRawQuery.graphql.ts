/**
 * @generated SignedSource<<6ec8481c5dd65f3135949cde725ac2e9>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type useAppConfigPublicRawQuery$variables = {
  configNames: ReadonlyArray<string>;
};
export type useAppConfigPublicRawQuery$data = {
  readonly scopedAppConfigFragmentsByNames: ReadonlyArray<{
    readonly config: any;
    readonly configName: string;
    readonly id: string;
  } | null | undefined>;
};
export type useAppConfigPublicRawQuery = {
  response: useAppConfigPublicRawQuery$data;
  variables: useAppConfigPublicRawQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "configNames"
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
        "kind": "Literal",
        "name": "scope",
        "value": {
          "scopeType": "PUBLIC"
        }
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
    "name": "useAppConfigPublicRawQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "useAppConfigPublicRawQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "bf1a302d87a854e1f7eb4fc16f29be48",
    "id": null,
    "metadata": {},
    "name": "useAppConfigPublicRawQuery",
    "operationKind": "query",
    "text": "query useAppConfigPublicRawQuery(\n  $configNames: [String!]!\n) {\n  scopedAppConfigFragmentsByNames(scope: {scopeType: PUBLIC}, configNames: $configNames) {\n    id\n    configName\n    config\n  }\n}\n"
  }
};
})();

(node as any).hash = "621b4f7461517e46e40fb4b63d76ef39";

export default node;

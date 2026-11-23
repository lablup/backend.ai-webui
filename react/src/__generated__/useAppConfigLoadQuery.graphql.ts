/**
 * @generated SignedSource<<3a10d1a16f2bea7b62753303ae97e6b1>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type useAppConfigLoadQuery$variables = {
  configNames: ReadonlyArray<string>;
};
export type useAppConfigLoadQuery$data = {
  readonly myAppConfigs: ReadonlyArray<{
    readonly config: any;
    readonly configName: string;
  }>;
};
export type useAppConfigLoadQuery = {
  response: useAppConfigLoadQuery$data;
  variables: useAppConfigLoadQuery$variables;
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
      }
    ],
    "concreteType": "AppConfig",
    "kind": "LinkedField",
    "name": "myAppConfigs",
    "plural": true,
    "selections": [
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
    "name": "useAppConfigLoadQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "useAppConfigLoadQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "bee7a22f2344b8ab788600367fc38335",
    "id": null,
    "metadata": {},
    "name": "useAppConfigLoadQuery",
    "operationKind": "query",
    "text": "query useAppConfigLoadQuery(\n  $configNames: [String!]!\n) {\n  myAppConfigs(configNames: $configNames) {\n    configName\n    config\n  }\n}\n"
  }
};
})();

(node as any).hash = "e1c183023143e99d9f5796edaded121d";

export default node;

/**
 * @generated SignedSource<<ef194d8d6ebebf50b7eaecd4f6c669ef>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type useAppConfigMyQuery$variables = {
  configNames: ReadonlyArray<string>;
};
export type useAppConfigMyQuery$data = {
  readonly myAppConfigs: ReadonlyArray<{
    readonly config: any;
    readonly configName: string;
  }>;
};
export type useAppConfigMyQuery = {
  response: useAppConfigMyQuery$data;
  variables: useAppConfigMyQuery$variables;
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
    "name": "useAppConfigMyQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "useAppConfigMyQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "9e89356de6cfbbec3c5ab6a3abae5ccc",
    "id": null,
    "metadata": {},
    "name": "useAppConfigMyQuery",
    "operationKind": "query",
    "text": "query useAppConfigMyQuery(\n  $configNames: [String!]!\n) {\n  myAppConfigs(configNames: $configNames) {\n    configName\n    config\n  }\n}\n"
  }
};
})();

(node as any).hash = "202cdeea55d7128e47305776c0859d4f";

export default node;

/**
 * @generated SignedSource<<ef96df4e5222a14ab70ef6a80a3a6138>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type useBAIAppConfigMergedQuery$variables = {
  configNames: ReadonlyArray<string>;
};
export type useBAIAppConfigMergedQuery$data = {
  readonly myAppConfigs: ReadonlyArray<{
    readonly config: any;
    readonly configName: string;
  }>;
};
export type useBAIAppConfigMergedQuery = {
  response: useBAIAppConfigMergedQuery$data;
  variables: useBAIAppConfigMergedQuery$variables;
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
    "name": "useBAIAppConfigMergedQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "useBAIAppConfigMergedQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "3a0cf0c3e39c021510835f832351ccb7",
    "id": null,
    "metadata": {},
    "name": "useBAIAppConfigMergedQuery",
    "operationKind": "query",
    "text": "query useBAIAppConfigMergedQuery(\n  $configNames: [String!]!\n) {\n  myAppConfigs(configNames: $configNames) {\n    configName\n    config\n  }\n}\n"
  }
};
})();

(node as any).hash = "1161697cd667f04e4efee1492d955389";

export default node;

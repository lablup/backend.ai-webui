/**
 * @generated SignedSource<<bd64de1dc0adbf0e63d0cfe0d13d9ca0>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type useBAIAppConfigMyRawQuery$variables = {
  configNames: ReadonlyArray<string>;
};
export type useBAIAppConfigMyRawQuery$data = {
  readonly myAppConfigFragmentsByNames: ReadonlyArray<{
    readonly config: any;
    readonly configName: string;
    readonly id: string;
  } | null | undefined>;
};
export type useBAIAppConfigMyRawQuery = {
  response: useBAIAppConfigMyRawQuery$data;
  variables: useBAIAppConfigMyRawQuery$variables;
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
    "concreteType": "AppConfigFragment",
    "kind": "LinkedField",
    "name": "myAppConfigFragmentsByNames",
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
    "name": "useBAIAppConfigMyRawQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "useBAIAppConfigMyRawQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "9712e1e1c264746d6aef3bd681356032",
    "id": null,
    "metadata": {},
    "name": "useBAIAppConfigMyRawQuery",
    "operationKind": "query",
    "text": "query useBAIAppConfigMyRawQuery(\n  $configNames: [String!]!\n) {\n  myAppConfigFragmentsByNames(configNames: $configNames) {\n    id\n    configName\n    config\n  }\n}\n"
  }
};
})();

(node as any).hash = "d824273dfecfc8683dee4e237bc68ab6";

export default node;

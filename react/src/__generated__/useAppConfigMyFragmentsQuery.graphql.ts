/**
 * @generated SignedSource<<7d187430f67f4a8de25e2ee4f7970083>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type useAppConfigMyFragmentsQuery$variables = {
  configNames: ReadonlyArray<string>;
};
export type useAppConfigMyFragmentsQuery$data = {
  readonly myAppConfigFragmentsByNames: ReadonlyArray<{
    readonly config: any;
    readonly configName: string;
    readonly id: string;
  } | null | undefined>;
};
export type useAppConfigMyFragmentsQuery = {
  response: useAppConfigMyFragmentsQuery$data;
  variables: useAppConfigMyFragmentsQuery$variables;
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
    "name": "useAppConfigMyFragmentsQuery",
    "selections": (v1/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "useAppConfigMyFragmentsQuery",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "16a87e6480ce48302d69f7a41cc816c6",
    "id": null,
    "metadata": {},
    "name": "useAppConfigMyFragmentsQuery",
    "operationKind": "query",
    "text": "query useAppConfigMyFragmentsQuery(\n  $configNames: [String!]!\n) {\n  myAppConfigFragmentsByNames(configNames: $configNames) {\n    id\n    configName\n    config\n  }\n}\n"
  }
};
})();

(node as any).hash = "fb257c9ef979bfbf73148d33883438de";

export default node;
